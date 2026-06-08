import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkActivity() {
  console.log('--- Latest 10 Agent Runs ---')
  const { data: runs, error: runsError } = await supabase
    .from('agent_runs')
    .select('id, task_type, status, created_at, completed_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (runsError) console.error(runsError)
  else console.table(runs)

  console.log('\n--- Latest 10 System Logs ---')
  const { data: logs, error: logsError } = await supabase
    .from('system_logs')
    .select('event_type, status, message, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (logsError) console.error(logsError)
  else console.table(logs)
}

checkActivity()
