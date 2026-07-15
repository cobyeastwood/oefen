import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  {
    ignores: ['**/dist', '**/api/index.js', '**/node_modules', '**/.nx'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'bundle:api',
              notDependOnLibsWithTags: ['bundle:worker'],
            },
            // Nx blocks lib imports unless a matching allow-rule exists.
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
];
