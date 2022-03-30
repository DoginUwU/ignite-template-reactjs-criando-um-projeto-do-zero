import Link from 'next/link';
import { FaCalendar, FaUser } from 'react-icons/fa';
import { Post } from '../../@types/post';
import { formatDate } from '../../utils/format';
import styles from './postCard.module.scss';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { title, subtitle, author } = post.data;

  return (
    <Link href={`post/${post.uid}`}>
      <div className={styles.post}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className={styles.footer}>
          <div>
            <FaCalendar />
            {formatDate(new Date(post.first_publication_date))}
          </div>
          <div>
            <FaUser />
            {author}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
