// app/api/learning/patterns/route.ts
// ============================================
// 📚 Patterns API - Learning Patterns with Supabase
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        patterns: [],
        total: 0
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');

    let dbQuery = supabaseAdmin
      .from('patterns')
      .select('*')
      .eq('shared', true);

    // Filter by search query
    if (query) {
      dbQuery = dbQuery.ilike('task', `%${query}%`);
    }

    // Filter by category (from tags in architecture)
    if (category) {
      dbQuery = dbQuery.contains('architecture->tags', [category]);
    }

    // Order by rating + upvotes
    dbQuery = dbQuery
      .order('rating', { ascending: false })
      .order('upvotes', { ascending: false })
      .limit(limit);

    const { data: patterns, error } = await dbQuery;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      patterns: patterns || [],
      total: patterns?.length || 0
    });

  } catch (error: any) {
    console.error('GET /api/learning/patterns error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 503 });
    }

    const body = await request.json();

    const { data: pattern, error } = await supabaseAdmin
      .from('patterns')
      .insert({
        task: body.task,
        architecture: body.architecture,
        rating: body.rating || 0,
        user_id: body.userId || 'anonymous',
        shared: body.shared !== false,
        usage_count: 1
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      pattern,
      message: 'Pattern uploaded successfully to cloud'
    });

  } catch (error: any) {
    console.error('POST /api/learning/patterns error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
