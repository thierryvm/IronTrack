# 🚀 IronTrack - Deployment Guide

## 📋 Overview
Complete deployment guide for IronTrack fitness tracking application.

## 🛠️ Technology Stack
- **Frontend**: Next.js 15.3.5 with TypeScript
- **Database**: Supabase (PostgreSQL)  
- **Styling**: Tailwind CSS + Framer Motion
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Deployment**: Vercel (recommended)

## 🗄️ Database Setup

### 1. Create New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region closest to your users
4. Note down your project URL and anon key

### 2. Execute Database Schema
```sql
-- Run the complete schema from database-template.sql
-- This includes:
-- - All tables and relationships
-- - Row Level Security policies  
-- - Indexes for performance
-- - Default data (equipment, badges)
-- - Admin functions
```

### 3. Configure Authentication
In Supabase Dashboard → Authentication:
- Enable email authentication
- Configure email templates (optional)
- Set site URL: `https://your-domain.com`
- Add redirect URLs for development: `http://localhost:3000`

### 4. Setup Storage (for file uploads)
```sql
-- Create storage bucket for support attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('support-attachments', 'support-attachments', false);

-- Create storage policies
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## ⚙️ Application Configuration

### 1. Environment Variables
Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build and Test
```bash
npm run build
npm run dev
```

## 🔐 Admin Setup

### 1. Create First Admin User
```sql
-- After registering through the app, promote user to admin
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'your-admin@email.com';
```

### 2. Test Admin Access
- Navigate to `/admin` 
- Verify dashboard loads with statistics
- Test ticket management system
- Check user management features

## 🚀 Production Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Works with minor configuration changes
- **AWS**: Use Amplify or EC2 with proper setup
- **Docker**: Dockerfile included for containerization

## 📊 Post-Deployment Checklist

### Security
- [ ] All RLS policies active and tested
- [ ] Admin routes protected by middleware
- [ ] File upload security configured
- [ ] HTTPS enabled and enforced

### Performance  
- [ ] Database indexes created
- [ ] CDN configured for static assets
- [ ] Image optimization enabled
- [ ] Monitoring tools configured

### Functionality
- [ ] User registration/login works
- [ ] Exercise and workout creation
- [ ] Performance tracking
- [ ] Admin dashboard functional
- [ ] Support ticket system operational

## 🔧 Maintenance

### Regular Tasks
- Monitor database performance
- Review admin logs for unusual activity  
- Update dependencies monthly
- Backup database regularly

### Scaling Considerations
- Monitor Supabase usage limits
- Optimize queries as user base grows
- Consider database connection pooling
- Implement caching for static data

## 📞 Support

For technical issues during deployment:
1. Check Supabase logs for database errors
2. Review Next.js build logs
3. Verify all environment variables are set
4. Test RLS policies in Supabase SQL editor

## 💰 Monetization Ready Features

### User Management
- Role-based access control
- Subscription tiers ready (extend profiles table)
- Usage analytics built-in

### Admin Tools  
- Complete user management dashboard
- Content moderation system
- Support ticket handling
- Audit trail for compliance

### Scalability
- Multi-tenant ready architecture
- API endpoints for mobile apps
- Partner system for B2B integration
- White-label customization possible

---

**IronTrack v1.0** - Production Ready Fitness Platform
Contact: [Your Business Email]