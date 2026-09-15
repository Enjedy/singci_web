import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// Configuration Supabase SignCi
// ------------------------------------------------------------
// Remplacez ces valeurs par celles de VOTRE projet Supabase :
//   1. Dashboard Supabase -> Settings -> API
//      -> Project URL                       -> lib/main.dart:11
//      -> anon / public key                 -> lib/main.dart:12
//   2. Executez le SQL ci-dessous dans SQL Editor (une fois) :
//
//   alter table signalement
//     add column if not exists "assignedTeam" text;
//
//   -- Active le Realtime sur la table signalement :
//   -- Dashboard -> Database -> Replication -> source: postgres
//   -- -> supervised -> sélectionnez la table "signalement"
//   --   (events: INSERT / UPDATE / DELETE)
// ============================================================

export const SUPABASE_URL = 'https://hhjapqczihuobvkeyduk.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_mWmV1B1hQc6eY6FqUvW_VQ_WFW_PA6a';

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);