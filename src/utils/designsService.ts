import { Design } from '../data/designs';
import { getSupabaseClient } from './supabaseClient';
import { getStoredDesigns, saveStoredDesigns } from './designsStorage';

export async function fetchDesigns(): Promise<Design[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      // 1. Try fetching ordered by sort_order
      let { data, error } = await supabase
        .from('designs')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false });

      // If sort_order column doesn't exist yet in Supabase table, fallback to created_at
      if (error) {
        const fallback = await supabase
          .from('designs')
          .select('*')
          .order('created_at', { ascending: false });
        data = fallback.data;
        error = fallback.error;
      }

      if (!error && Array.isArray(data)) {
        const cloudDesigns: Design[] = data.map((item, idx) => ({
          id: String(item.id),
          name: item.name || '',
          tag: item.tag || '',
          url: item.url || '',
          image: item.image || '',
          sort_order: typeof item.sort_order === 'number' ? item.sort_order : idx,
        }));

        // Guarantee ascending order by sort_order
        cloudDesigns.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

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
  const designWithOrder: Design = {
    ...newDesign,
    sort_order: 0,
  };
  const updatedList: Design[] = [
    designWithOrder,
    ...currentDesigns.map((d, idx) => ({ ...d, sort_order: idx + 1 })),
  ];

  // Always save locally first for instant UI response
  saveStoredDesigns(updatedList);

  if (supabase) {
    try {
      const payload: Record<string, any> = {
        id: designWithOrder.id,
        name: designWithOrder.name,
        tag: designWithOrder.tag || '',
        url: designWithOrder.url,
        image: designWithOrder.image,
        sort_order: 0,
      };

      let { error } = await supabase.from('designs').insert([payload]);

      // If sort_order column does not exist yet in Supabase table
      if (error && error.message?.toLowerCase().includes('sort_order')) {
        delete payload.sort_order;
        const retry = await supabase.from('designs').insert([payload]);
        error = retry.error;
      }

      if (error) {
        console.error('Failed to insert design into Supabase:', error.message);
      } else {
        // Update others' sort_order if supported
        await Promise.allSettled(
          currentDesigns.map((d, idx) =>
            supabase.from('designs').update({ sort_order: idx + 1 }).eq('id', d.id)
          )
        );
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
  const existing = currentDesigns.find((d) => d.id === updatedDesign.id);
  const designToSave: Design = {
    ...updatedDesign,
    sort_order: updatedDesign.sort_order ?? existing?.sort_order ?? 0,
  };

  const updatedList = currentDesigns.map((d) =>
    d.id === updatedDesign.id ? designToSave : d
  );

  saveStoredDesigns(updatedList);

  if (supabase) {
    try {
      const payload: Record<string, any> = {
        name: designToSave.name,
        tag: designToSave.tag || '',
        url: designToSave.url,
        image: designToSave.image,
        sort_order: designToSave.sort_order,
      };

      let { error } = await supabase
        .from('designs')
        .update(payload)
        .eq('id', designToSave.id);

      if (error && error.message?.toLowerCase().includes('sort_order')) {
        delete payload.sort_order;
        const retry = await supabase
          .from('designs')
          .update(payload)
          .eq('id', designToSave.id);
        error = retry.error;
      }

      if (error) {
        console.error('Failed to update design in Supabase:', error.message);
      }
    } catch (e) {
      console.error('Supabase update exception:', e);
    }
  }

  return updatedList;
}

export async function reorderDesignsInService(
  reorderedList: Design[]
): Promise<Design[]> {
  const listWithUpdatedOrders: Design[] = reorderedList.map((d, index) => ({
    ...d,
    sort_order: index,
  }));

  // Save locally immediately
  saveStoredDesigns(listWithUpdatedOrders);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Update each design's sort_order in Supabase
      const updates = listWithUpdatedOrders.map((d) =>
        supabase
          .from('designs')
          .update({ sort_order: d.sort_order })
          .eq('id', d.id)
      );

      await Promise.allSettled(updates);
    } catch (e) {
      console.warn('Failed to update sort order in Supabase:', e);
    }
  }

  return listWithUpdatedOrders;
}

export async function deleteDesignFromService(
  id: string,
  currentDesigns: Design[]
): Promise<Design[]> {
  const supabase = getSupabaseClient();
  const remaining = currentDesigns.filter((d) => d.id !== id);
  const updatedList: Design[] = remaining.map((d, idx) => ({
    ...d,
    sort_order: idx,
  }));

  saveStoredDesigns(updatedList);

  if (supabase) {
    try {
      const { error } = await supabase.from('designs').delete().eq('id', id);

      if (error) {
        console.error('Failed to delete design from Supabase:', error.message);
      } else {
        // Normalize sort orders for remaining
        await Promise.allSettled(
          updatedList.map((d) =>
            supabase.from('designs').update({ sort_order: d.sort_order }).eq('id', d.id)
          )
        );
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
