-- Restrict realtime broadcast subscriptions so a user can only listen on
-- their own `user-session-{their_id}` channel, per Supabase's documented
-- Authorization pattern for Realtime Broadcast.
-- https://supabase.com/docs/guides/realtime/authorization

create policy "Users can read their own session channel"
on realtime.messages
for select
to authenticated
using (
  realtime.topic() = 'user-session-' || auth.uid()::text
);
