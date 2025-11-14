import { checkData, returnDefault } from '../src/utils/utils.js';

describe('Utils', () => {
  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test'),
    size: 100
  } as Express.Multer.File;

  describe('checkData', () => {
    it('should return invalid when file is missing', () => {
      const result = checkData(undefined, 'users', '123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File missing');
    });

    it('should return invalid when type is missing', () => {
      const result = checkData(mockFile, '', '123');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid type');
    });

    it('should return invalid when entityId is missing', () => {
      const result = checkData(mockFile, 'users', '');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing entityId');
    });

    it('should return valid when all required data is provided', () => {
      const result = checkData(mockFile, 'users', '123');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });
  });

  describe('returnDefault', () => {
    it('should return events default for event-related types', () => {
      const type = "events/eventId/test.png".split("/")[0];
      expect(returnDefault(type)).toBe('events/default.png');
    });

    it('should return users default for user-related types', () => {
      const type = "users/userId/test.png".split("/")[0];
      expect(returnDefault(type)).toBe('users/default.png');
    });

    it('should return generic default for unknown types', () => {
      expect(returnDefault('unknown')).toBe('default.png');
      expect(returnDefault('posts')).toBe('default.png');
      expect(returnDefault('userAvatar')).toBe('default.png');
    });

    it('should return generic default for undefined type', () => {
      expect(returnDefault("")).toBe('default.png');
    });
  });
});