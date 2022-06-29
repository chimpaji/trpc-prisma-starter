import NextError from 'next/error';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import React from 'react';

const PostViewPage: NextPageWithLayout = () => {
  const id = useRouter().query.id as string;
  const postQuery = trpc.useQuery(['post.byId', { id }]);
  const utils = trpc.useContext();
  //todo: load comments for this post
  const commentQuery = trpc.useQuery(['comment.byPostId', { id }]);
  const addComment = trpc.useMutation('comment.add', {
    async onSuccess() {
      await utils.invalidateQueries(['comment.byPostId', { id }]);
    },
  });
  if (postQuery.error) {
    return (
      <NextError
        title={postQuery.error.message}
        statusCode={postQuery.error.data?.httpStatus ?? 500}
      />
    );
  }

  if (postQuery.status !== 'success') {
    return <>Loading...</>;
  }
  const { data } = postQuery;
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const $name = e.target.elements.name;
    const $message = e.target.elements.comment;
    const input = {
      name: $name.value,
      message: $message.value,
      postId: id,
    };
    $name.value = '';
    $message.value = '';
    addComment.mutate(input);
  };
  return (
    <>
      <h1>{data.title}</h1>
      <em>Created {data.createdAt.toLocaleDateString('en-us')}</em>

      <p>{data.text}</p>

      <h2>Raw data:</h2>
      <pre>{JSON.stringify(data, null, 4)}</pre>

      <h2>Comments for This Post</h2>
      <ul>
        {commentQuery.data?.map((comment) => (
          <li key={comment?.id}>
            <p>{comment?.name}:</p>
            <p>{comment?.message}</p>
            <p>Posted on {comment?.createdAt.toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
      <form action="post" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <br />
        <input type="text" name="name" id="name" />
        <br />
        <label htmlFor="comment">Comment</label>
        <br />
        <input type="text" name="comment" id="comment" />
        <br />
        <input type="hidden" name="postId" value={data.id} />
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default PostViewPage;
