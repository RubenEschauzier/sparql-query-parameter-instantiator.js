import type { ReadStream, WriteStream } from 'node:tty';
import { runCli, runConfig, runCustom } from '../lib/CliRunner';

jest.mock('componentsjs', () => ({
  ComponentsManager: {
    build: jest.fn(),
  },
}));

const flushPromises = (): Promise<void> => new Promise(setImmediate);

describe('CliRunner', () => {
  const { ComponentsManager } = require('componentsjs');
  const mockBuild: jest.Mock = ComponentsManager.build;

  let mockRegister: jest.Mock;
  let mockManagerInstantiate: jest.Mock;
  let mockInstantiate: jest.Mock;

  let stderr: { write: jest.Mock };
  let stdout: WriteStream;
  let stdin: ReadStream;

  beforeEach(() => {
    jest.clearAllMocks();

    stderr = { write: jest.fn() };
    stdout = <WriteStream> <unknown> {};
    stdin = <ReadStream> <unknown> {};

    mockInstantiate = jest.fn().mockResolvedValue(undefined);
    mockManagerInstantiate = jest.fn().mockResolvedValue({ instantiate: mockInstantiate });
    mockRegister = jest.fn().mockResolvedValue(undefined);

    mockBuild.mockResolvedValue({
      configRegistry: { register: mockRegister },
      instantiate: mockManagerInstantiate,
    });
  });

  describe('runConfig', () => {
    it('should build the manager, register the config, and run the instantiator', async() => {
      const properties = { mainModulePath: '/module/root' };
      await runConfig('path/to/config.json', properties);

      expect(mockBuild).toHaveBeenCalledWith(properties);
      expect(mockRegister).toHaveBeenCalledWith('path/to/config.json');
      expect(mockManagerInstantiate).toHaveBeenCalledWith(
        'urn:sparql-query-parameter-instantiator:default',
        undefined,
      );
      expect(mockInstantiate).toHaveBeenCalledTimes(1);
    });

    it('should forward construction settings to the manager', async() => {
      const properties = { mainModulePath: '/module/root' };
      const settings = { variables: { key: 'val' }};
      await runConfig('path/to/config.json', properties, settings);

      expect(mockManagerInstantiate).toHaveBeenCalledWith(
        'urn:sparql-query-parameter-instantiator:default',
        settings,
      );
    });
  });

  describe('runCustom', () => {
    it('should write a usage error to stderr when no arguments are provided', async() => {
      runCustom([], stdin, stdout, <WriteStream> <unknown> stderr, { mainModulePath: '/module/root' });
      await flushPromises();

      expect(stderr.write).toHaveBeenCalledWith(expect.stringContaining('Missing config path argument'));
      expect(mockBuild).not.toHaveBeenCalled();
    });

    it('should write a usage error to stderr when more than one argument is provided', async() => {
      runCustom(
        [ 'config.json', 'extra.json' ],
        stdin,
        stdout,
        <WriteStream> <unknown> stderr,
        { mainModulePath: '/module/root' },
      );
      await flushPromises();

      expect(stderr.write).toHaveBeenCalledWith(expect.stringContaining('Missing config path argument'));
      expect(mockBuild).not.toHaveBeenCalled();
    });

    it('should invoke runConfig when exactly one argument is provided', async() => {
      runCustom([ 'config.json' ], stdin, stdout, <WriteStream> <unknown> stderr, { mainModulePath: '/module/root' });
      await flushPromises();

      expect(mockBuild).toHaveBeenCalledWith({ mainModulePath: '/module/root' });
      expect(mockRegister).toHaveBeenCalledWith('config.json');
      expect(mockInstantiate).toHaveBeenCalledTimes(1);
    });

    it('should write the error stack to process.stderr and exit with code 1 when runConfig rejects', async() => {
      const error = new Error('something went wrong');
      error.stack = 'Error: something went wrong\n  at Test';
      mockBuild.mockRejectedValue(error);

      const mockProcessStderrWrite = jest.spyOn(process.stderr, 'write').mockReturnValue(true);
      const mockExit = jest.spyOn(process, 'exit')
        .mockImplementation((_code?: string | number | null): never => <never> undefined);

      try {
        runCustom([ 'config.json' ], stdin, stdout, <WriteStream> <unknown> stderr, { mainModulePath: '/module/root' });
        await flushPromises();

        expect(mockProcessStderrWrite).toHaveBeenCalledWith(`${error.stack}\n`);
        expect(mockExit).toHaveBeenCalledWith(1);
      } finally {
        mockProcessStderrWrite.mockRestore();
        mockExit.mockRestore();
      }
    });
  });

  describe('runCli', () => {
    it('should call runCustom using process.argv arguments', async() => {
      const originalArgv = process.argv;
      process.argv = [ 'node', 'runner.js' ];

      const mockProcessStderrWrite = jest.spyOn(process.stderr, 'write').mockReturnValue(true);

      try {
        runCli('/module/root');
        await flushPromises();

        // 0 args passed → usage error written to process.stderr
        expect(mockProcessStderrWrite).toHaveBeenCalledWith(expect.stringContaining('Missing config path argument'));
      } finally {
        process.argv = originalArgv;
        mockProcessStderrWrite.mockRestore();
      }
    });
  });
});
