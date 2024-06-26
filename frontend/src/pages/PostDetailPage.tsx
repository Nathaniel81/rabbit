import { buttonVariants } from '@/components/ui/Button';
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import EditorOutput from '@/components/EditorOutput';
import { formatTimeToNow } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'
import { useParams, Link } from 'react-router-dom';
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import PostVote from '@/components/PostVote';
import { useQuery } from '@tanstack/react-query';
import { getCsrfToken } from '@/lib/utils';
import axios from 'axios';
import { Post } from '@/types/post'
import CommentsSection from '@/components/CommentsSection';
import { useEffect } from 'react';
import { Comment } from '@/types/post';

const Loader = () => {
  return (
    <div className="flex items-center h-screen w-full justify-center mx-auto">
      <Loader2 className='h-15 w-15 animate-spin text-zinc-500' />
    </div>
  )
}

const PostDetailPage = () => {
    const { id } = useParams();
    const user = useSelector((state: RootState) => state.user);

    const detailQueryKey = [`postDetail ${id}`];
    const { data: post, isPending } = useQuery<Post>({
      queryKey: detailQueryKey,
      queryFn: async () => {
        const config = {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "x-csrftoken": getCsrfToken()
          },
        }
        const response = await axios.get(`/api/post-detail/${id}/`, config);
        const res = await response.data
        return res;
      },
    });

    const commentQueryKey = [`postComments ${id}`];
    const { data: comments } = useQuery<Comment[]>({
      queryKey: commentQueryKey,
      queryFn: async () => {
        const config = {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "x-csrftoken": getCsrfToken()
          },
        }
        const response = await axios.get(`/api/posts/${id}/comments/`, config);
        const res = await response.data
        return res;
      },
    });

    const votesAmt = post?.votes.reduce((acc, vote) => {
      if (vote.type === 'UP') return acc + 1
      if (vote.type === 'DOWN') return acc - 1
      return acc
      }, 0)

      const currentVote = post?.votes.find(
        (vote) => vote.user === user?.user_id
      )

      useEffect(() => {
        window.scrollTo(0, 0);
      }, []);

  
  return (
    <div className='sm:container max-w-7xl mx-auto h-full py-12 my-7'>
        {isPending ? (
          <Loader />
        ): (
        <>
          <div className='py-2'>
            <Link
              to='/'
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'self-start -mt-22'
              )}>
              <ChevronLeft className='mr-2 h-4 w-4' />
              Home
            </Link>
          </div>
          <div className='h-full flex flex-col sm:flex-row align items-center sm:items-start justify-between mt-1'>
        <div className='hidden md:block'>
          <Suspense fallback={<PostVoteShell />}>
            <PostVote
              postId={post?.id}
              initialVotesAmt={votesAmt}
              initialVote={currentVote?.type}
            />
          </Suspense>
        </div>
        <div className='sm:w-0 w-full flex-1 bg-white p-4 rounded-sm'>
         <p className='max-h-40 mt-1 truncate text-xs text-gray-500'>
           Posted by u/{post?.author.username }{' '}
           {post && formatTimeToNow(new Date(post?.created_at))}
         </p>
         <h1 className='text-xl font-semibold py-2 leading-6 text-gray-900'>
           {post?.title}
         </h1>
      
         <EditorOutput content={post?.content} />
         <div className='md:hidden'>
          <Suspense fallback={<PostVoteShell />}>
            <PostVote
              postId={post?.id}
              initialVotesAmt={votesAmt}
              initialVote={currentVote?.type}
            />
          </Suspense>
        </div>
         <Suspense
           fallback={
             <Loader2 className='h-5 w-5 animate-spin text-zinc-500' />
           }>
           <CommentsSection comments={comments} />
         </Suspense>
        </div>
          </div>
        </>
      )}
      </div>
  );
};

function PostVoteShell() {
    return (
      <div className='flex items-center flex-col pr-6 w-20'>
        {/* upvote */}
        <div className={buttonVariants({ variant: 'ghost' })}>
          <ArrowBigUp className='h-5 w-5 text-zinc-700' />
        </div>
  
        {/* score */}
        <div className='text-center py-2 font-medium text-sm text-zinc-900'>
          <Loader2 className='h-3 w-3 animate-spin' />
        </div>
  
        {/* downvote */}
        <div className={buttonVariants({ variant: 'ghost' })}>
          <ArrowBigDown className='h-5 w-5 text-zinc-700' />
        </div>
      </div>
    )
  }

export default PostDetailPage;