import * as yup from 'yup';

// --- PageType ---

export const createPageTypeSchema = yup.object({
  name: yup.string().required('Name is required'),
  slug: yup.string()
    .required('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  description: yup.string().nullable().optional(),
  parent_id: yup.string().nullable().optional(),
});

export const updatePageTypeSchema = createPageTypeSchema;

// --- PageSeo ---

export const upsertPageSeoSchema = yup.object({
  meta_title: yup.string().nullable().optional(),
  meta_description: yup.string().nullable().optional(),
  meta_keywords: yup.string().nullable().optional(),
  og_title: yup.string().nullable().optional(),
  og_description: yup.string().nullable().optional(),
  og_image_id: yup.string().nullable().optional(),
  canonical_url: yup.string().url('Must be a valid URL').nullable().optional(),
  robots: yup.string().nullable().optional(),
});

// --- PageSchema ---

export const upsertPageSchemaSchema = yup.object({
  schema_type: yup.string().nullable().optional(),
  schema_data: yup.mixed().nullable().optional(),
});

// --- Page ---

export const createPageSchema = yup.object({
  slug: yup.string()
    .required('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  title: yup.string().required('Title is required'),
  content: yup.string().optional(),
  detail: yup.mixed().nullable().optional(),
  excerpt: yup.string().nullable().optional(),
  status: yup.string().oneOf(['draft', 'published']).default('draft'),
  locale: yup.string().oneOf(['en', 'np']).default('en'),
  parent_id: yup.string().nullable().optional(),
  page_type_id: yup.string().nullable().optional(),
  thumbnail_id: yup.string().nullable().optional(),
});

export const updatePageSchema = yup.object({
  slug: yup.string()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
    .optional(),
  title: yup.string().optional(),
  content: yup.string().optional(),
  detail: yup.mixed().nullable().optional(),
  excerpt: yup.string().nullable().optional(),
  locale: yup.string().oneOf(['en', 'np']).optional(),
  parent_id: yup.string().nullable().optional(),
  page_type_id: yup.string().nullable().optional(),
  thumbnail_id: yup.string().nullable().optional(),
});

export type CreatePageTypeInput = yup.InferType<typeof createPageTypeSchema>;
export type UpdatePageTypeInput = yup.InferType<typeof updatePageTypeSchema>;
export type CreatePageInput = yup.InferType<typeof createPageSchema>;
export type UpdatePageInput = yup.InferType<typeof updatePageSchema>;
export type UpsertPageSeoInput = yup.InferType<typeof upsertPageSeoSchema>;
export type UpsertPageSchemaInput = yup.InferType<typeof upsertPageSchemaSchema>;
