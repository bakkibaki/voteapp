import { Comment } from "./types";
import { supabase } from "./supabase";

export async function getAllComments(): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return (data || []).map(comment => ({
    id: comment.id,
    voteId: comment.vote_id,
    userId: comment.user_id,
    userName: comment.user_name,
    userAvatar: comment.user_avatar,
    content: comment.content,
    parentId: comment.parent_id,
    likes: comment.likes || [],
    createdAt: comment.created_at,
    voteChanged: comment.vote_changed || false,
    votedOptionText: comment.voted_option_text,
    needsReply: false, // 一時的にfalseに設定
  }));
}

export async function getCommentsByVoteId(voteId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('vote_id', voteId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return (data || []).map(comment => ({
    id: comment.id,
    voteId: comment.vote_id,
    userId: comment.user_id,
    userName: comment.user_name,
    userAvatar: comment.user_avatar,
    content: comment.content,
    parentId: comment.parent_id,
    likes: comment.likes || [],
    createdAt: comment.created_at,
    voteChanged: comment.vote_changed || false,
    votedOptionText: comment.voted_option_text,
    needsReply: false, // 一時的にfalseに設定
  }));
}

export async function createComment(comment: Comment): Promise<Comment> {
  const insertData: any = {
    id: comment.id,
    vote_id: comment.voteId,
    user_id: comment.userId,
    user_name: comment.userName,
    user_avatar: comment.userAvatar,
    content: comment.content,
    parent_id: comment.parentId,
    likes: comment.likes || [],
    created_at: comment.createdAt,
    vote_changed: comment.voteChanged || false,
    voted_option_text: comment.votedOptionText,
  };

  // needs_replyカラムがデータベースに存在する場合のみ追加
  // 後でデータベースにカラムを追加したら、この行のコメントを解除
  // if (comment.needsReply !== undefined) {
  //   insertData.needs_reply = comment.needsReply;
  // }

  const { data, error } = await supabase
    .from('comments')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw new Error('Failed to create comment');
  }

  return {
    id: data.id,
    voteId: data.vote_id,
    userId: data.user_id,
    userName: data.user_name,
    userAvatar: data.user_avatar,
    content: data.content,
    parentId: data.parent_id,
    likes: data.likes || [],
    createdAt: data.created_at,
    voteChanged: data.vote_changed || false,
    votedOptionText: data.voted_option_text,
    needsReply: false, // 一時的にfalseに設定
  };
}

export async function updateCommentNeedsReply(
  commentId: string,
  needsReply: boolean
): Promise<Comment | null> {
  // 将来的にneeds_replyカラムがデータベースに追加されたら、このコメントを解除
  // const { data, error } = await supabase
  //   .from('comments')
  //   .update({ needs_reply: needsReply })
  //   .eq('id', commentId)
  //   .select()
  //   .single();

  // if (error || !data) {
  //   console.error('Error updating comment needs reply:', error);
  //   return null;
  // }

  // 一時的に、現在のコメントを取得して返す（更新はスキップ）
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('id', commentId)
    .single();

  if (error || !data) {
    console.error('Error fetching comment:', error);
    return null;
  }

  return {
    id: data.id,
    voteId: data.vote_id,
    userId: data.user_id,
    userName: data.user_name,
    userAvatar: data.user_avatar,
    content: data.content,
    parentId: data.parent_id,
    likes: data.likes || [],
    createdAt: data.created_at,
    voteChanged: data.vote_changed || false,
    votedOptionText: data.voted_option_text,
    needsReply: needsReply, // 引数で受け取った値を設定（一時的）
  };
}

export async function toggleCommentLike(
  commentId: string,
  userId: string
): Promise<Comment | null> {
  // まず現在のコメントを取得
  const { data: currentComment, error: fetchError } = await supabase
    .from('comments')
    .select('*')
    .eq('id', commentId)
    .single();

  if (fetchError || !currentComment) {
    console.error('Error fetching comment:', fetchError);
    return null;
  }

  const likes = currentComment.likes || [];
  const likeIndex = likes.indexOf(userId);

  let updatedLikes;
  if (likeIndex > -1) {
    // いいねを削除
    updatedLikes = likes.filter((id: string) => id !== userId);
  } else {
    // いいねを追加
    updatedLikes = [...likes, userId];
  }

  // 更新
  const { data, error } = await supabase
    .from('comments')
    .update({ likes: updatedLikes })
    .eq('id', commentId)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating comment likes:', error);
    return null;
  }

  return {
    id: data.id,
    voteId: data.vote_id,
    userId: data.user_id,
    userName: data.user_name,
    userAvatar: data.user_avatar,
    content: data.content,
    parentId: data.parent_id,
    likes: data.likes || [],
    createdAt: data.created_at,
    voteChanged: data.vote_changed || false,
    votedOptionText: data.voted_option_text,
    needsReply: false, // 一時的にfalseに設定
  };
}
