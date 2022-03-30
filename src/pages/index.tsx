import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { useState } from 'react';
import { Post } from '../@types/post';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import { prismicGetText } from '../utils/format';

interface PostPagination {
  next_page?: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  async function getMorePosts() {
    await fetch(nextPage)
      .then(data => data.json())
      .then(response => {
        const postsResponse = response.results.map(post => {
          return {
            uid: post.uid,
            data: {
              title: prismicGetText(post.data.title),
              subtitle: prismicGetText(post.data.subtitle),
              author: prismicGetText(post.data.author),
            },
            first_publication_date: post.first_publication_date,
          };
        });
        setPosts([...postsResponse, ...posts]);
        setNextPage(response.next_page);
      });
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <PostCard key={post.uid} post={post} />
          ))}
        </div>
        {!!nextPage && <span onClick={getMorePosts}>Carregar mais posts</span>}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  const postsResults = postsResponse.results.map<Post>(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: prismicGetText(post.data.title),
        subtitle: prismicGetText(post.data.subtitle),
        author: prismicGetText(post.data.author),
      },
    };
  });

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResults,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
