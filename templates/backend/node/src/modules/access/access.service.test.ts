import { describe, expect, it } from 'vitest';
import { canView, type AccessRule, type Viewer } from './access.service.js';

const viewer = (overrides: Partial<Viewer> = {}): Viewer => ({
  id: 'u-1',
  name: 'Ana',
  email: 'ana@farmarcas.com.br',
  isAdmin: false,
  groupIds: ['g-1'],
  ...overrides,
});

const rule = (overrides: Partial<AccessRule> = {}): AccessRule => ({
  status: 'published',
  archived: false,
  accessAll: false,
  accessGroupIds: [],
  accessUserIds: [],
  ...overrides,
});

describe('canView', () => {
  it('deve liberar quando a solução é para toda a empresa', () => {
    expect(canView(rule({ accessAll: true }), viewer({ groupIds: [] }))).toBe(true);
  });

  it('deve liberar quando a pessoa está listada nominalmente', () => {
    expect(canView(rule({ accessUserIds: ['u-1'] }), viewer({ groupIds: [] }))).toBe(true);
  });

  it('deve liberar quando a pessoa é membro de um grupo liberado', () => {
    expect(canView(rule({ accessGroupIds: ['g-2', 'g-1'] }), viewer())).toBe(true);
  });

  it('deve bloquear quando nenhuma regra alcança a pessoa', () => {
    expect(canView(rule({ accessGroupIds: ['g-2'], accessUserIds: ['u-9'] }), viewer())).toBe(
      false,
    );
  });

  it('deve bloquear solução em avaliação mesmo liberada para todos', () => {
    expect(canView(rule({ status: 'in_review', accessAll: true }), viewer())).toBe(false);
  });

  it('deve bloquear solução arquivada mesmo liberada para todos', () => {
    expect(canView(rule({ archived: true, accessAll: true }), viewer())).toBe(false);
  });

  it('não deve dar acesso extra a admin', () => {
    expect(canView(rule({ accessGroupIds: ['g-2'] }), viewer({ isAdmin: true }))).toBe(false);
  });
});
