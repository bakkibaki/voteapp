import { Vote } from "./types";
import { supabase } from "./supabase";

export async function getAllVotes(): Promise<Vote[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching votes:', error);
    return [];
  }

  // 各投票のコメント数を取得
  const votesWithCommentCount = await Promise.all(
    (data || []).map(async (vote) => {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('vote_id', vote.id);

      return {
        id: vote.id,
        title: vote.title,
        options: vote.options,
        createdAt: vote.created_at,
        category: vote.category,
        authorId: vote.author_id,
        authorName: vote.author_name,
        voteRecords: vote.vote_records || [],
        showAnalytics: vote.show_analytics,
        commentCount: count || 0,
      };
    })
  );

  return votesWithCommentCount;
}

export async function getVoteById(id: string): Promise<Vote | null> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching vote:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    options: data.options,
    createdAt: data.created_at,
    category: data.category,
    authorId: data.author_id,
    authorName: data.author_name,
    voteRecords: data.vote_records || [],
    showAnalytics: data.show_analytics,
  };
}

export async function createVote(vote: Vote): Promise<Vote> {
  const { data, error } = await supabase
    .from('votes')
    .insert([{
      id: vote.id,
      title: vote.title,
      options: vote.options,
      created_at: vote.createdAt,
      category: vote.category,
      author_id: vote.authorId,
      author_name: vote.authorName,
      vote_records: vote.voteRecords || [],
      show_analytics: vote.showAnalytics !== undefined ? vote.showAnalytics : true,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating vote:', error);
    throw new Error('Failed to create vote');
  }

  return {
    id: data.id,
    title: data.title,
    options: data.options,
    createdAt: data.created_at,
    category: data.category,
    authorId: data.author_id,
    authorName: data.author_name,
    voteRecords: data.vote_records || [],
    showAnalytics: data.show_analytics,
  };
}

export async function updateVote(id: string, updatedVote: Vote): Promise<Vote | null> {
  const { data, error } = await supabase
    .from('votes')
    .update({
      title: updatedVote.title,
      options: updatedVote.options,
      category: updatedVote.category,
      author_id: updatedVote.authorId,
      author_name: updatedVote.authorName,
      vote_records: updatedVote.voteRecords || [],
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating vote:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    options: data.options,
    createdAt: data.created_at,
    category: data.category,
    authorId: data.author_id,
    authorName: data.author_name,
    voteRecords: data.vote_records || [],
  };
}

export async function deleteVote(id: string, userId: string): Promise<boolean> {
  // まず投票を取得して作成者か確認
  const { data: vote, error: fetchError } = await supabase
    .from('votes')
    .select('author_id')
    .eq('id', id)
    .single();

  if (fetchError || !vote) {
    console.error('Error fetching vote:', fetchError);
    return false;
  }

  // 作成者でない場合は削除を拒否
  if (vote.author_id !== userId) {
    console.error('Unauthorized: User is not the author');
    return false;
  }

  // 関連するコメントも削除
  await supabase
    .from('comments')
    .delete()
    .eq('vote_id', id);

  // 投票を削除
  const { error: deleteError } = await supabase
    .from('votes')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Error deleting vote:', deleteError);
    return false;
  }

  return true;
}
