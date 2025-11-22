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

  return (data || []).map(vote => ({
    id: vote.id,
    title: vote.title,
    options: vote.options,
    createdAt: vote.created_at,
    category: vote.category,
    authorId: vote.author_id,
    authorName: vote.author_name,
    voteRecords: vote.vote_records || [],
  }));
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
