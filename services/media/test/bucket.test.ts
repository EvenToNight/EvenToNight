import { S3Client, HeadBucketCommand, GetObjectCommand, CreateBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client, uploadFileToS3, ensureBucketWithDefaults, getImagesFromBucket } from '../src/util/bucket.js';
import { Readable } from 'stream';
import express from 'express';
import fs from 'fs/promises';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('fs/promises');

const MockedS3Client = S3Client as jest.MockedClass<typeof S3Client>;
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock process.env
const mockEnv = {
  MINIO_ENDPOINT: 'http://localhost:9000',
  MINIO_ACCESS_KEY: 'testkey',
  MINIO_SECRET_KEY: 'testsecret'
};

interface MockS3Client {
  send: jest.Mock;
}

describe('Bucket Utils', () => {
  let mockS3Client: MockS3Client;
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...process.env, ...mockEnv };
    mockS3Client = {
      send: jest.fn()
    };
    
    MockedS3Client.mockImplementation(() => mockS3Client as unknown as S3Client);
  });

  describe('createS3Client', () => {
    it('should create S3Client with correct configuration', () => {
      const client = createS3Client();
      
      expect(S3Client).toHaveBeenCalledWith({
        endpoint: 'http://localhost:9000',
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'testkey',
          secretAccessKey: 'testsecret'
        },
        forcePathStyle: true
      });
      expect(client).toBeDefined();
    });

    it('should use empty strings for missing credentials', () => {
      delete process.env.MINIO_ACCESS_KEY;
      delete process.env.MINIO_SECRET_KEY;
      
      createS3Client();
      
      expect(S3Client).toHaveBeenCalledWith({
        endpoint: 'http://localhost:9000',
        region: 'us-east-1',
        credentials: {
          accessKeyId: '',
          secretAccessKey: ''
        },
        forcePathStyle: true
      });
    });
  });

  describe('uploadFileToS3', () => {
    it('should upload file successfully', async () => {
      mockS3Client.send.mockResolvedValue({});
      
      const buffer = Buffer.from('test file content');
      const key = 'test/file.jpg';
      const bucketName = 'test-bucket';
      const contentType = 'image/jpeg';
      
      const result = await uploadFileToS3(mockS3Client as unknown as S3Client, bucketName, key, buffer, contentType);
      
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(PutObjectCommand)
      );
      
      expect(result).toBe(key);
    });

    it('should throw error when bucket name is undefined', async () => {
      const buffer = Buffer.from('test');
      
      await expect(
        uploadFileToS3(mockS3Client as unknown as S3Client, undefined, 'key', buffer, 'image/jpeg')
      ).rejects.toThrow('Bucket name is required');
      
      expect(mockS3Client.send).not.toHaveBeenCalled();
    });

    it('should throw error when bucket name is empty string', async () => {
      const buffer = Buffer.from('test');
      
      await expect(
        uploadFileToS3(mockS3Client as unknown as S3Client, '', 'key', buffer, 'image/jpeg')
      ).rejects.toThrow('Bucket name is required');
    });

    it('should propagate S3 errors', async () => {
      const s3Error = new Error('S3 upload failed');
      mockS3Client.send.mockRejectedValue(s3Error);
      
      const buffer = Buffer.from('test');
      
      await expect(
        uploadFileToS3(mockS3Client as unknown as S3Client, 'bucket', 'key', buffer, 'image/jpeg')
      ).rejects.toThrow('S3 upload failed');
    });
  });

  describe('ensureBucketWithDefaults', () => {
    it('should not create bucket if it already exists', async () => {
      mockS3Client.send.mockResolvedValue({});
      
      await ensureBucketWithDefaults(mockS3Client as unknown as S3Client, 'existing-bucket');
      
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(HeadBucketCommand)
      );
    });

    it('should create bucket and upload defaults when bucket does not exist', async () => {
      const notFoundError = { 
        name: 'NotFound',
        $metadata: { httpStatusCode: 404 } 
      };
      
      mockS3Client.send
        .mockRejectedValueOnce(notFoundError)
        .mockResolvedValue({});
      
      mockedFs.readFile.mockResolvedValue(Buffer.from('fake image data'));
      
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/fake/path');
      
      await ensureBucketWithDefaults(mockS3Client as unknown as S3Client, 'new-bucket');
      
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(HeadBucketCommand));
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(CreateBucketCommand));
      
      process.cwd = originalCwd;
    });

    it('should throw error when bucket name is undefined', async () => {
      await expect(
        ensureBucketWithDefaults(mockS3Client as unknown as S3Client, undefined)
      ).rejects.toThrow('Bucket name is required');
    });

    it('should propagate non-NotFound errors', async () => {
      const otherError = new Error('Network error');
      mockS3Client.send.mockRejectedValue(otherError);
      
      await expect(
        ensureBucketWithDefaults(mockS3Client as unknown as S3Client, 'bucket')
      ).rejects.toThrow('Network error');
    });
  });

  describe('getImagesFromBucket', () => {
    let mockResponse: Partial<express.Response>;
    let mockReadable: Partial<Readable>;

    beforeEach(() => {
      mockReadable = {
        pipe: jest.fn()
      };

      mockResponse = {
        setHeader: jest.fn()
      };
    });

    it('should get image and pipe to response', async () => {
      const mockS3Response = {
        Body: mockReadable,
        ContentType: 'image/jpeg',
        ContentLength: 12345
      };
      
      mockS3Client.send.mockResolvedValue(mockS3Response);
      
      await getImagesFromBucket(
        mockS3Client as unknown as S3Client, 
        'bucket', 
        'path/to/image.jpg', 
        mockResponse as express.Response
      );
      
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(GetObjectCommand)
      );
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Length', 12345);
      expect(mockReadable.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should use default content type when not provided', async () => {
      const mockS3Response = {
        Body: mockReadable,
        ContentType: undefined,
        ContentLength: undefined
      };
      
      mockS3Client.send.mockResolvedValue(mockS3Response);
      
      await getImagesFromBucket(
        mockS3Client as unknown as S3Client, 
        'bucket', 
        'image.jpg', 
        mockResponse as express.Response
      );
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Length', 0);
    });

    it('should throw error when no body in S3 response', async () => {
      const mockS3Response = {
        Body: undefined,
        ContentType: 'image/jpeg'
      };
      
      mockS3Client.send.mockResolvedValue(mockS3Response);
      
      await expect(
        getImagesFromBucket(
          mockS3Client as unknown as S3Client, 
          'bucket', 
          'image.jpg', 
          mockResponse as express.Response
        )
      ).rejects.toThrow('No data received from S3');
    });

    it('should propagate S3 errors', async () => {
      const s3Error = new Error('Object not found');
      mockS3Client.send.mockRejectedValue(s3Error);
      
      await expect(
        getImagesFromBucket(
          mockS3Client as unknown as S3Client, 
          'bucket', 
          'missing.jpg', 
          mockResponse as express.Response
        )
      ).rejects.toThrow('Object not found');
    });
  });
});