import { validateUploadFile, returnDefault, validateDeleteParams } from '../src/utils/utils.js';

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
      const result = validateUploadFile(undefined, 'users', '123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File missing');
    });

    it('should return invalid when type is missing', () => {
      const result = validateUploadFile(mockFile, '', '123');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid type');
    });

    it('should return invalid when entityId is missing', () => {
      const result = validateUploadFile(mockFile, 'users', '');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing entityId');
    });

    it('should return valid when all required data is provided', () => {
      const result = validateUploadFile(mockFile, 'users', '123');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });
  });

  describe('returnDefault', () => {
    it('should return events default for event-related types', () => {
      const type = "events/id_event/test.png".split("/")[0];
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

  describe('validateDeleteParams', () => {
    it('should return invalid when type is not users or events', () => {
      const result = validateDeleteParams('posts', 'entityId', 'filename.jpg');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid type');
    });

    it('should return invalid when entityId is missing', () => {
      const result = validateDeleteParams('users', '', 'filename.jpg');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing entityId');
    });

    it('should return invalid when filename is missing', () => {
      const result = validateDeleteParams('users', 'entityId', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing filename');
    });

    it('should return valid when all parameters are correct for users', () => {
      const result = validateDeleteParams('users', 'user123', 'profile.jpg');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    it('should return valid when all parameters are correct for events', () => {
      const result = validateDeleteParams('events', 'event456', 'poster.png');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });
  });
});