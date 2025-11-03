# Moderation System - Supabase Schema

This document describes the database schema required for the moderation system. Copy and execute the SQL below in your Supabase SQL editor.

## Migration Script

```sql
-- Create moderation_queue table for audit trail and content review
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL DEFAULT 'general', -- 'post', 'comment', 'lighter_name', 'profile'
  content TEXT NOT NULL,
  content_url TEXT,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,

  -- Moderation details from OpenAI API
  flagged BOOLEAN NOT NULL DEFAULT false,
  categories JSONB NOT NULL DEFAULT '{}', -- { "hate": false, "harassment": true, ... }
  scores JSONB NOT NULL DEFAULT '{}', -- { "hate": 0.05, "harassment": 0.72, ... }
  severity TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high'

  -- Review & enforcement
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'under_review'
  review_notes TEXT,
  action_taken TEXT, -- 'none', 'warning', 'content_removed', 'account_suspended'

  -- Reviewer info
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  CONSTRAINT valid_action CHECK (action_taken IN ('none', 'warning', 'content_removed', 'account_suspended'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_moderation_queue_user_id ON moderation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_flagged ON moderation_queue(flagged) WHERE flagged = true;
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status) WHERE status != 'approved';
CREATE INDEX IF NOT EXISTS idx_moderation_queue_severity ON moderation_queue(severity);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_content_type ON moderation_queue(content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON moderation_queue(created_at DESC);

-- Enable RLS
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own flagged content, admins can see all
CREATE POLICY moderation_queue_view_policy ON moderation_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.raw_user_meta_data->>'is_moderator' = 'true')
    )
    OR user_id = auth.uid()
  );

-- RLS Policy: Only server-side API can insert
CREATE POLICY moderation_queue_insert_policy ON moderation_queue
  FOR INSERT
  WITH CHECK (false); -- Via API only

-- RLS Policy: Only admins can update
CREATE POLICY moderation_queue_update_policy ON moderation_queue
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.raw_user_meta_data->>'is_moderator' = 'true')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.raw_user_meta_data->>'is_moderator' = 'true')
    )
  );

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_moderation_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER moderation_queue_update_timestamp
BEFORE UPDATE ON moderation_queue
FOR EACH ROW
EXECUTE FUNCTION update_moderation_queue_updated_at();

-- Helper function to log moderation results
CREATE OR REPLACE FUNCTION log_moderation_result(
  p_user_id UUID,
  p_content_type TEXT,
  p_content TEXT,
  p_content_url TEXT DEFAULT NULL,
  p_post_id UUID DEFAULT NULL,
  p_flagged BOOLEAN DEFAULT false,
  p_categories JSONB DEFAULT '{}',
  p_scores JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'low'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO moderation_queue (
    user_id, content_type, content, content_url, post_id,
    flagged, categories, scores, severity, status
  ) VALUES (
    p_user_id, p_content_type, p_content, p_content_url, p_post_id,
    p_flagged, p_categories, p_scores, p_severity,
    CASE WHEN p_flagged THEN 'pending' ELSE 'approved' END
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON moderation_queue TO authenticated;
GRANT EXECUTE ON FUNCTION log_moderation_result TO authenticated;
```

## Table Structure

### Main Table: `moderation_queue`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who created the flagged content |
| `content_type` | TEXT | Type of content: 'post', 'comment', 'lighter_name', 'profile', 'general' |
| `content` | TEXT | The actual content that was moderated |
| `content_url` | TEXT | URL if applicable (for images) |
| `post_id` | UUID | Reference to the post (if applicable) |
| `flagged` | BOOLEAN | Whether content was flagged by OpenAI |
| `categories` | JSONB | OpenAI categories (e.g., `{"hate": false, "harassment": true}`) |
| `scores` | JSONB | OpenAI confidence scores for each category |
| `severity` | TEXT | 'low', 'medium', or 'high' |
| `status` | TEXT | 'pending', 'approved', 'rejected', 'under_review' |
| `review_notes` | TEXT | Admin notes about the review |
| `action_taken` | TEXT | Action: 'none', 'warning', 'content_removed', 'account_suspended' |
| `reviewed_by` | UUID | Admin who reviewed the content |
| `reviewed_at` | TIMESTAMP | When the review happened |
| `created_at` | TIMESTAMP | When the moderation check occurred |
| `updated_at` | TIMESTAMP | Last updated timestamp |

## Setup Instructions

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy the entire SQL script above
5. Execute the query
6. Verify the table is created by checking the Tables list

## Next: Database Logging Implementation

After creating this schema, update `/app/api/moderate-text/route.ts` and `/app/api/moderate-image/route.ts` to call the `log_moderation_result` function:

```typescript
async function logModerationResult(data: { ... }): Promise<void> {
  const supabase = createClient(); // Your Supabase client

  const { error } = await supabase.rpc('log_moderation_result', {
    p_user_id: data.userId,
    p_content_type: data.contentType,
    p_content: data.text || data.imageUrl,
    p_content_url: data.imageUrl || null,
    p_flagged: data.flagged,
    p_categories: data.categories,
    p_scores: data.scores,
    p_severity: data.severity,
  });

  if (error) {
    console.error('Failed to log moderation result:', error);
    // Don't throw - moderation logging is non-critical
  }
}
```

## Query Examples

### Get pending reviews
```sql
SELECT id, user_id, content_type, severity, created_at
FROM moderation_queue
WHERE status = 'pending'
ORDER BY severity DESC, created_at ASC;
```

### Get user's moderation history
```sql
SELECT * FROM moderation_queue
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;
```

### Get high-severity flagged content
```sql
SELECT id, user_id, content_type, reason, created_at
FROM moderation_queue
WHERE flagged = true AND severity = 'high'
ORDER BY created_at DESC;
```

### Get statistics
```sql
SELECT
  severity,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
FROM moderation_queue
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY severity;
```

## Admin Dashboard Queries

To build the admin dashboard, you'll need to query this table with filters for:
- Status (pending, approved, rejected, under_review)
- Severity (low, medium, high)
- Content type
- Date range
- User

All of this is optimized with the provided indexes.
