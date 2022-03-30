import { GetStaticPaths, GetStaticProps } from 'next';
import { FaCalendar, FaClock, FaUser } from 'react-icons/fa';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import { formatDate, prismicGetHtml, prismicGetText } from '../../utils/format';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    subtitle: string;
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}
interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const tempRead = post.data.content.reduce((acc, content) => {
    const textBody = RichText.asText(content.body)
      .split(/<.+?>(.+?)<\/.+?>/g)
      .filter(t => t);

    const ar = [];
    textBody.forEach(fr => {
      fr.split(' ').forEach(pl => {
        ar.push(pl);
      });
    });

    const min = Math.ceil(ar.length / 200);
    return acc + min;
  }, 0);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <img src={post.data.banner.url} alt="Background" />
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>{post.data.title}</h1>
            <div className={styles.icons}>
              <div>
                <FaCalendar />
                {formatDate(new Date(post.first_publication_date))}
              </div>
              <div>
                <FaUser />
                {post.data.author}
              </div>
              <div>
                <FaClock />
                {tempRead} min
              </div>
            </div>
          </div>
          {post.data.content.map(contentBody => (
            <div key={contentBody.heading}>
              <strong>{contentBody.heading}</strong>
              {contentBody.body.map(body => (
                <div
                  key={body.text}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: body.text,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['post.uid'],
      pageSize: 100,
    }
  );

  const postsPaths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths: postsPaths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: prismicGetText(response.data.title),
      subtitle: prismicGetText(response.data.subtitle),
      author: prismicGetText(response.data.author),
      banner: {
        url: prismicGetText(response.data.banner.url),
      },
      content: response.data.content.map(content => {
        return {
          heading: prismicGetText(content.heading),
          body: content.body,
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
  };
};
