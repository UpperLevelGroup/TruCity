import { supabase } from '../lib/supabase';

export type CandidateProfileInput = {
  headline?: string;
  bio?: string;
  location?: string;
  yearsExperience: number;
  profileCompletion: number;
};

type CandidateSkillInput = {
  name: string;
  proficiency?: string;
  yearsUsed?: number;
};

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error('You must be signed in.');
  }

  return user.id;
}

export async function getMyCandidateProfile() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('candidate_profiles')
    .select(`
      id,
      user_id,
      headline,
      bio,
      location,
      years_experience,
      profile_completion,
      created_at,
      candidate_skills (
        proficiency,
        years_used,
        skills (
          id,
          name
        )
      )
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function saveCandidateProfile(input: CandidateProfileInput) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('candidate_profiles')
    .upsert(
      {
        user_id: userId,
        headline: input.headline || null,
        bio: input.bio || null,
        location: input.location || null,
        years_experience: input.yearsExperience,
        profile_completion: input.profileCompletion,
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function saveCandidateSkills(
  candidateId: string,
  skills: CandidateSkillInput[],
) {
  for (const skill of skills) {
    const name = skill.name.trim();

    if (!name) {
      continue;
    }

    const { data: savedSkill, error: skillError } = await supabase
      .from('skills')
      .upsert({ name }, { onConflict: 'name' })
      .select('id')
      .single();

    if (skillError) {
      throw new Error(skillError.message);
    }

    const { error: candidateSkillError } = await supabase
      .from('candidate_skills')
      .upsert(
        {
          candidate_id: candidateId,
          skill_id: savedSkill.id,
          proficiency: skill.proficiency || 'BEGINNER',
          years_used: skill.yearsUsed || 0,
        },
        { onConflict: 'candidate_id,skill_id' },
      );

    if (candidateSkillError) {
      throw new Error(candidateSkillError.message);
    }
  }
}

export async function saveProfileSetup(
  yearsExperience: number,
  skills: string[],
) {
  const profile = await saveCandidateProfile({
    yearsExperience,
    profileCompletion: 60,
  });

  await saveCandidateSkills(
    profile.id,
    skills.map((name) => ({
      name,
      proficiency: 'BEGINNER',
      yearsUsed: yearsExperience,
    })),
  );

  return profile;
}

export async function getOpenJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      description,
      location,
      employment_type,
      salary_min,
      salary_max,
      status,
      created_at,
      companies (
        id,
        name,
        industry,
        website
      )
    `)
    .eq('status', 'OPEN')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function applyForJob(jobId: string) {
  const profile = await getMyCandidateProfile();

  if (!profile) {
    throw new Error('Complete your candidate profile before applying.');
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      candidate_id: profile.id,
      status: 'SUBMITTED',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getMyApplications() {
  const profile = await getMyCandidateProfile();

  if (!profile) {
    return [];
  }

  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      applied_at,
      jobs (
        id,
        title,
        location,
        employment_type,
        companies (
          name
        )
      )
    `)
    .eq('candidate_id', profile.id)
    .order('applied_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createVerificationRequest(verificationType: string) {
  const profile = await getMyCandidateProfile();

  if (!profile) {
    throw new Error('Complete your candidate profile first.');
  }

  const { data, error } = await supabase
    .from('verification_requests')
    .insert({
      candidate_id: profile.id,
      verification_type: verificationType,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}