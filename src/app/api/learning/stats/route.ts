// app/api/learning/stats/route.ts
// ============================================
// 📊 Stats API - Global Learning Statistics from Supabase
// ============================================

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Get total projects count
    const { count: totalProjects } = await supabaseAdmin
      .from('patterns')
      .select('*', { count: 'exact', head: true });

    // Get unique users count
    const { data: uniqueUsers } = await supabaseAdmin
      .from('user_stats')
      .select('user_id');

    // Get average rating
    const { data: patterns } = await supabaseAdmin
      .from('patterns')
      .select('rating');

    const averageScore = patterns && patterns.length > 0
      ? Math.round(patterns.reduce((sum, p) => sum + p.rating, 0) / patterns.length)
      : 0;

    // Calculate top categories
    const { data: allPatterns } = await supabaseAdmin
      .from('patterns')
      .select('architecture');

    const categoryCount: Record<string, number> = {};

    allPatterns?.forEach((p) => {
      const tags = p.architecture?.tags || [];
      tags.forEach((tag: string) => {
        categoryCount[tag] = (categoryCount[tag] || 0) + 1;
      });
    });

    const stats = {
      metadata: {
        totalUsers: uniqueUsers?.length || 0,
        totalProjects: totalProjects || 0,
        lastUpdate: Date.now()
      },
      topCategories: categoryCount,
      averageScore,
      communityGrowth: 18 // TODO: Calculate from created_at timestamps
    };

    return NextResponse.json({
      success: true,
      ...stats
    });

  } catch (error: any) {
    console.error('GET /api/learning/stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
