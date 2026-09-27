package com.aman.protection.data.remote

import com.aman.protection.core.AmanConstants
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.realtime.realtime
import io.ktor.client.engine.android.Android

/**
 * تهيئة وإدارة عميل Supabase الرسمي لتطبيق AMAN
 * اتصال حقيقي بقاعدة البيانات: https://pvgmtufzvwkdvtbtcijn.supabase.co
 */
object SupabaseProvider {

    val client: SupabaseClient by lazy {
        createSupabaseClient(
            supabaseUrl = AmanConstants.SUPABASE_URL,
            supabaseKey = AmanConstants.SUPABASE_ANON_KEY
        ) {
            httpEngine = Android.create()

            install(Auth) {
                alwaysAutoRefresh = true
                autoLoadFromStorage = true
            }

            install(Postgrest)
            install(Realtime)
        }
    }

    val auth: Auth get() = client.auth
    val postgrest: Postgrest get() = client.postgrest
    val realtime: Realtime get() = client.realtime
}
