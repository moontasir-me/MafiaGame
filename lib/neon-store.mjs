import {neon} from '@neondatabase/serverless';
export class NeonRoomStore{
 constructor(url){this.sql=neon(url);this.ready=null;this.cache=new Map();}
 async init(){if(!this.ready)this.ready=this.sql.transaction([
  this.sql`SELECT pg_advisory_xact_lock(148932711)`,
  this.sql`CREATE TABLE IF NOT EXISTS public.mafia_rooms(id text PRIMARY KEY, revision bigint NOT NULL DEFAULT 1, payload jsonb NOT NULL, expires_at timestamptz NOT NULL DEFAULT now()+interval '6 hours')`,
  this.sql`CREATE INDEX IF NOT EXISTS mafia_rooms_expiry ON public.mafia_rooms(expires_at)`,
  this.sql`CREATE TABLE IF NOT EXISTS public.mafia_rate_limits(key text PRIMARY KEY, count integer NOT NULL, resets_at timestamptz NOT NULL)`,
 ]).catch(e=>{this.ready=null;throw e;});return this.ready;}
 remember(id,revision,payload){this.cache.delete(id);this.cache.set(id,{revision,payload:JSON.stringify(payload),touched:Date.now()});while(this.cache.size>24||[...this.cache.values()].reduce((n,v)=>n+v.payload.length,0)>8_000_000)this.cache.delete(this.cache.keys().next().value);}
 async create(id,payload){await this.init();const rows=await this.sql`INSERT INTO public.mafia_rooms(id,payload) VALUES(${id},${JSON.stringify(payload)}::jsonb) ON CONFLICT DO NOTHING RETURNING revision`;if(!rows.length)return false;this.remember(id,1,payload);return true;}
 async load(id){await this.init();const rows=await this.sql`SELECT revision FROM public.mafia_rooms WHERE id=${id} AND expires_at>now()`;if(!rows.length){this.cache.delete(id);return null;}const cached=this.cache.get(id);if(cached&&cached.revision===Number(rows[0].revision))return {revision:cached.revision,payload:JSON.parse(cached.payload)};const data=await this.sql`SELECT revision,payload FROM public.mafia_rooms WHERE id=${id} AND expires_at>now()`;if(!data.length)return null;const {revision,payload}=data[0];this.remember(id,Number(revision),payload);return {revision:Number(revision),payload};}
 async save(id,revision,payload){await this.init();const rows=await this.sql`UPDATE public.mafia_rooms SET payload=${JSON.stringify(payload)}::jsonb,revision=revision+1,expires_at=now()+interval '6 hours' WHERE id=${id} AND revision=${revision} AND expires_at>now() RETURNING revision`;if(!rows.length)return false;this.remember(id,Number(rows[0].revision),payload);return true;}
 async touch(id){const cached=this.cache.get(id);if(cached&&Date.now()-cached.touched<60000)return;await this.sql`UPDATE public.mafia_rooms SET expires_at=now()+interval '6 hours' WHERE id=${id} AND expires_at>now()`;if(cached)cached.touched=Date.now();}
 async allowRate(key,limit,seconds){await this.init();const rows=await this.sql`INSERT INTO public.mafia_rate_limits(key,count,resets_at) VALUES(${key},1,now()+${seconds}*interval '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN mafia_rate_limits.resets_at<=now() THEN 1 ELSE mafia_rate_limits.count+1 END,resets_at=CASE WHEN mafia_rate_limits.resets_at<=now() THEN now()+${seconds}*interval '1 second' ELSE mafia_rate_limits.resets_at END RETURNING count`;return rows[0].count<=limit;}
 async cleanup(){await this.sql`DELETE FROM public.mafia_rooms WHERE expires_at<now()`;await this.sql`DELETE FROM public.mafia_rate_limits WHERE resets_at<now()-interval '1 hour'`;}
}
