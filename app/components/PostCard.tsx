import { Post, User } from "@prisma/client";
import { useEffect, useState } from "react";
import { useFetcher } from "remix";
import { EditPostResponse } from "../routes/posts/edit.$id";
import { classNames } from "../utils/helpers";
import DeletePostButton from "./DeletePostButton";
import PostHeader from "./PostHeader";

interface Props {
  post: Post & {
    User: User;
  };
  user?: User;
}

const PostCard = ({ post, user }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  const editFetcher = useFetcher<EditPostResponse>();
  const { data } = editFetcher;

  const contentError = !data?.ok && data?.fieldErrors?.content;
  useEffect(() => {
    if (editFetcher.type === "done" && editFetcher.data.ok) {
      setIsEditing(false);
    }
  }, [editFetcher]);

  return (
    <div className="w-full rounded-md border p-4 shadow-md">
      <PostHeader
        postedAt={post.createdAt}
        updatedAt={post.updatedAt}
        username={post.User.username}
        avatar={post.User.avatar}
        isEditable={!isEditing && post.userId === user?.id}
        onEdit={() => setIsEditing(true)}
      />
      {isEditing ? (
        <>
          <editFetcher.Form id="form-edit" method="post" action={`/posts/edit/${post.id}`}>
            <textarea
              id="content"
              className={classNames(
                "border border-gray-400 rounded-lg w-full p-2 font-light focus:outline-none focus:ring-2 focus:border-transparent",
                contentError ? "ring-2 ring-red-500" : "focus:ring-indigo-500 "
              )}
              name="content"
              rows={4}
              defaultValue={post.content}
            />
          </editFetcher.Form>

          {contentError && <div className="text-red-500 px-1">{contentError}</div>}
          <div className="flex justify-end mt-2 space-x-2">
            <DeletePostButton postId={post.id} />
            <button
              className="text-base py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-200"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              className="text-base py-2 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-indigo-200 disabled:opacity-75"
              type="submit"
              form="form-edit"
              disabled={editFetcher.state === "submitting"}
            >
              {editFetcher.state === "idle" ? "Edit" : "Editing..."}
            </button>
          </div>
        </>
      ) : (
        <div className="whitespace-pre-line">
          {editFetcher.submission?.formData.get("content") || post.content}
        </div>
      )}
    </div>
  );
};
export default PostCard;
