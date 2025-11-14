import { S3Client, HeadBucketCommand, GetObjectCommand, CreateBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client, uploadFile, ensureBucketWithDefaults, getImagesFromBucket } from '../src/utils/bucket.js';
import { Readable } from 'stream';
import express from 'express';

jest.mock('@aws-sdk/client-s3');
jest.mock('fs/promises');

const mockS3Client = { send: jest.fn() };
const MockedS3Client = S3Client as jest.MockedClass<typeof S3Client>;

describe('Bucket Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      MINIO_ENDPOINT: 'http://localhost:9000',
      MINIO_ACCESS_KEY: 'testkey',
      MINIO_SECRET_KEY: 'testsecret'
    };
    MockedS3Client.mockImplementation(() => mockS3Client as unknown as S3Client);
  });

  describe('createS3Client', () => {
    it('creates S3Client with correct configuration', () => {
      const s3Client = createS3Client();
      
      expect(S3Client).toHaveBeenCalledWith({
        endpoint: 'http://localhost:9000',
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'testkey',
          secretAccessKey: 'testsecret'
        },
        forcePathStyle: true
      });
      expect(s3Client).toBeDefined();
    });

    it('handles missing credentials', () => {
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

  describe('uploadFile', () => {
    const client = mockS3Client as unknown as S3Client;
    const buffer = Buffer.from('test data');

    it('uploads file successfully', async () => {
      mockS3Client.send.mockResolvedValue({});
      
      const result = await uploadFile(client, 'bucket', 'key', buffer, 'image/jpeg');
      
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(result).toBe('key');
    });

    it.each(['', undefined])('throws error for invalid bucket name: %s', async (bucketName) => {
      await expect(uploadFile(client, bucketName!, 'key', buffer, 'image/jpeg'))
        .rejects.toThrow('Bucket name is required');
    });

    it('propagates S3 errors', async () => {
      mockS3Client.send.mockRejectedValue(new Error('S3 upload failed'));
      
      await expect(uploadFile(client, 'bucket', 'key', buffer, 'image/jpeg'))
        .rejects.toThrow('S3 upload failed');
    });
  });

  describe('ensureBucketWithDefaults', () => {
    const client = mockS3Client as unknown as S3Client;

    it('does not create bucket if it exists', async () => {
      mockS3Client.send.mockResolvedValue({});
      
      await ensureBucketWithDefaults(client, 'existing-bucket');
      
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(HeadBucketCommand));
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('creates bucket when it does not exist', async () => {
      const notFoundError = { name: 'NotFound', $metadata: { httpStatusCode: 404 } };
      mockS3Client.send
        .mockRejectedValueOnce(notFoundError)
        .mockResolvedValue({});

      await ensureBucketWithDefaults(client, 'new-bucket');
      
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(HeadBucketCommand));
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(CreateBucketCommand));
    });

    it('throws error for empty bucket name', async () => {
      await expect(ensureBucketWithDefaults(client, ''))
        .rejects.toThrow('Bucket name is required');
    });

    it('propagates non-NotFound errors', async () => {
      mockS3Client.send.mockRejectedValue(new Error('Network error'));
      
      await expect(ensureBucketWithDefaults(client, 'bucket'))
        .rejects.toThrow('Network error');
    });
  });

  describe('getImagesFromBucket', () => {
    const client = mockS3Client as unknown as S3Client;
    const mockResponse = { setHeader: jest.fn() } as unknown as express.Response;
    const mockReadable = { pipe: jest.fn() } as unknown as Readable;

    it('gets image and pipes to response', async () => {
      const mockS3Response = {
        Body: mockReadable,
        ContentType: 'image/jpeg',
        ContentLength: 12345
      };
      mockS3Client.send.mockResolvedValue(mockS3Response);
      
      await getImagesFromBucket(client, 'bucket', 'image.jpg', mockResponse);
      
      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Length', 12345);
      expect(mockReadable.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('uses default content type when not provided', async () => {
      mockS3Client.send.mockResolvedValue({ Body: mockReadable });
      
      await getImagesFromBucket(client, 'bucket', 'image.jpg', mockResponse);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Length', 0);
    });

    it('throws error when no body in S3 response', async () => {
      mockS3Client.send.mockResolvedValue({ ContentType: 'image/jpeg' });
      
      await expect(getImagesFromBucket(client, 'bucket', 'image.jpg', mockResponse))
        .rejects.toThrow('No data received from S3');
    });

    it('propagates S3 errors', async () => {
      mockS3Client.send.mockRejectedValue(new Error('Object not found'));
      
      await expect(getImagesFromBucket(client, 'bucket', 'missing.jpg', mockResponse))
        .rejects.toThrow('Object not found');
    });
  });
});