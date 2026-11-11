import { Design } from '../data/designs';
import { getSupabaseClient } from './supabaseClient';
import { getStoredDesigns, saveStoredDesigns } from './designsStorage';

export async function fetchDesigns(): Promise<Design[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const cloudDesigns: Design[] = data.map((item) => ({
          id: String(item.id),
          name: item.name || '',
          tag: item.tag || '',
          url: item.url || '',
          image: item.image || '',
        }));

        // Cache cloud designs in localStorage for instant offline load
        saveStoredDesigns(cloudDesigns);
        return cloudDesigns;
      } else if (error) {
        console.warn('Supabase fetch error, using local designs:', error.message);
      }
    } catch (e) {
      console.warn('Supabase connection failed, using local designs:', e);
    }
  }

  // Fallback to local storage
  return getStoredDesigns();
}

export async function addDesignToService(
  newDesign: Design,
  currentDesigns: Design[]
): Promise<Design[]> {
  const supabase = getSupabaseClient();
  const updatedList = [newDesign, ...currentDesigns];

  // Always save locally first for instant UI response
  saveStoredDesigns(updatedList);

  if (supabase) {
    try {
      const { error } = await supabase.from('designs').insert([
        {
          id: newDesign.id,
          name: newDesign.name,
          tag: newDesign.tag || '',
          url: newDesign.url,
          image: newDesign.image,
        },
      ]);

      if (error) {
        console.error('Failed to insert design into Supabase:', error.message);
      }
    } catch (e) {
      console.error('Supabase insert exception:', e);
    }
  }

  return updatedList;
}

export async function updateDesignInService(
  updatedDesign: Design,
  currentDesigns: Design[]
): Promise<Design[]> {
  const supabase = getSupabaseClient();
  const updatedList = currentDesigns.map((d) => (d.id === updatedDesign.id ? updatedDesign : d));

  saveStoredDesigns(updatedList);

  if (supabase) {
    try {
      const { error } = await supabase
        .from('designs')
        .update({
          name: updatedDesign.name,
          tag: updatedDesign.tag || '',
          url: updatedDesign.url,
          image: updatedDesign.image,
        })
        .eq('id', updatedDesign.id);

      if (error) {
        console.error('Failed to update design in Supabase:', error.message);
      }
    } catch (e) {
      console.error('Supabase update exception:', e);
    }
  }

  return updatedList;
}

export async function deleteDesignFromService(
  id: string,
  currentDesigns: Design[]
): Promise<Design[]> {
  const supabase = getSupabaseClient();
  const updatedList = currentDesigns.filter((d) => d.id !== id);

  saveStoredDesigns(updatedList);

  if (supabase) {
    try {
      const { error } = await supabase.from('designs').delete().eq('id', id);

      if (error) {
        console.error('Failed to delete design from Supabase:', error.message);
      }
    } catch (e) {
      console.error('Supabase delete exception:', e);
    }
  }

  return updatedList;
}

// Subscribe to real-time changes if Supabase is active
export function subscribeToDesigns(onChange: () => void): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel('designs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'designs' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Realtime subscription error:', e);
    return () => {};
  }
}
