module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'header-max-length': [1, 'always', 72],
        'header-full-stop': [2, 'always'],
        'subject-full-stop': [0, 'always'],
        'type-enum': [
            2,
            'always',
            ['build', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'style', 'test', 'revert', 'version']
        ]
    }
}
