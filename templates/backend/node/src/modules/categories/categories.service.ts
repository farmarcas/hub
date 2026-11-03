export type CategoryRecord = { id: string; name: string };

export type CategoriesRepository = {
  list: () => Promise<CategoryRecord[]>;
  findByName: (name: string) => Promise<CategoryRecord | null>;
  create: (name: string) => Promise<CategoryRecord>;
};

export const makeCategoriesService = (repo: CategoriesRepository) => ({
  async list() {
    return { data: await repo.list() };
  },

  // Lista aberta: pedir uma categoria que já existe devolve a existente, sem duplicar.
  async createOrGet(rawName: string) {
    const name = rawName.trim();
    const existing = await repo.findByName(name);
    if (existing) return { category: existing, created: false };
    return { category: await repo.create(name), created: true };
  },
});

export type CategoriesService = ReturnType<typeof makeCategoriesService>;
