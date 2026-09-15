describe('Post status validation', () => {
  const VALID_STATUSES = ['IDEA', 'SCRIPTED', 'FILMED', 'POSTED'];

  test('accepts a valid status', () => {
    expect(VALID_STATUSES.includes('IDEA')).toBe(true);
  });

  test('rejects an invalid status', () => {
    expect(VALID_STATUSES.includes('DONE')).toBe(false);
  });
});

describe('Post data shape', () => {
  test('a new post object has the required fields', () => {
    const newPost = {
      title: 'Test post',
      contentBody: '',
      status: 'IDEA',
      userId: 'abc-123'
    };
    expect(newPost).toHaveProperty('title');
    expect(newPost).toHaveProperty('status');
    expect(newPost).toHaveProperty('userId');
  });

 test('empty title should fail validation', () => {
    const title = '';
    const isValid = title.trim().length > 0;
    expect(isValid).toBe(false);
});

test('non-empty title should pass validation', () => {
    const title = 'My post';
    const isValid = title.trim().length > 0;
    expect(isValid).toBe(true);
});
});