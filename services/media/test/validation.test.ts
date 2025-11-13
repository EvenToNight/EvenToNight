import { checkData, returnDefault } from '../src/util/validation.js';

describe('Validation Utils', () => {
  describe('checkData', () => {
    it('should return invalid when file is missing', () => {
      const result = checkData(undefined, 'users', '123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File missing');
    });

    it('should return invalid when type is missing', () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 100
      } as Express.Multer.File;

      const result = checkData(mockFile, '', '123');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Metadata missing');
    });

    it('should return invalid when entityId is missing', () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 100
      } as Express.Multer.File;

      const result = checkData(mockFile, 'users', '');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Metadata missing');
    });

    it('should return valid when all required data is provided', () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 100
      } as Express.Multer.File;

      const result = checkData(mockFile, 'users', '123');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });
  });

  describe('returnDefault', () => {
    it('should return events default for event-related types', () => {
      const type = "events/events1/test.png".split("/")[0];
      const type2 = "events/events2/test.png".split("/")[0];
      expect(returnDefault(type)).toBe('events/default.png');
      expect(returnDefault(type2)).toBe('events/default.png');
    });

    it('should return users default for user-related types', () => {
      const type = "users/".split("/")[0];
      const type2 = 'users/user1/test.png'.split("/")[0];
      expect(returnDefault(type)).toBe('users/default.png');
      expect(returnDefault(type2)).toBe('users/default.png');
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