import { fs } from 'zx';

const pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));
const platform = process.platform;
const APP_NAME = pkg.name;
const BIN_PATH = './bin';
const SENTINEL_FUSE = 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2';
const SEA_CONFIG_FILE = 'sea-config.json';
const BLOB_FILE = 'sea-prep.blob';
const DIST_PATH = './dist';
const requiredTools = ['pnpm', 'node'];
const APP_FILE = `${BIN_PATH}/${APP_NAME}${platform === 'win32' ? '.exe' : ''}`;
const BLOB_PATH = `${BIN_PATH}/${BLOB_FILE}`;

const exitWithError = (message) => {
    console.error(message);
    process.exit(1);
};

const createBinDirectoryIfNeeded = async () => {
    if (await fs.exists(BIN_PATH)) {
        await fs.remove(BIN_PATH);
    }
    await fs.ensureDir(BIN_PATH);
};

const checkRequiredTools = async () => {
    for (const tool of requiredTools) {
        try {
            const { stdout } = await $`${tool} --version`;
            console.log(`${tool} version: ${stdout.trim()}`);
        } catch {
            console.error(`Required tool "${tool}" is not installed or not found in PATH.`);
            return false;
        }
    }
    return true;
};

const generateSeaBlob = async () => {
    if (!(await fs.exists(SEA_CONFIG_FILE))) {
        exitWithError(`The "${SEA_CONFIG_FILE}" file is missing. Please ensure it is present in the current directory.`);
    }

    console.log('Generating SEA blob...');
    try {
        await $`node --experimental-sea-config ${SEA_CONFIG_FILE}`;
        console.log('SEA blob generated successfully.');
    } catch (error) {
        exitWithError(`Failed to generate SEA blob: ${error?.message || error}`);
    }
};

const copyNodeBinary = async () => {
    try {
        await fs.copy(process.execPath, APP_FILE);
        console.log(`Node binary copied to ${APP_FILE}`);
    } catch (error) {
        exitWithError(`Failed to copy Node binary: ${error?.message || error}`);
    }
};

const checkIfCanStart = async () => {
    const hasTools = await checkRequiredTools();
    if (!hasTools) {
        exitWithError('One or more required tools are missing. Please ensure you have pnpm and node installed.');
    }

    if (!['darwin', 'linux', 'win32'].includes(platform)) {
        exitWithError(`Unsupported platform: ${platform}. Supported platforms are: darwin, linux, win32.`);
    }
};

const namedStep = (name, fn, subprocess = false) => async () => {
    console.log(`${subprocess ? '>' : ''}>> ${name}`);
    await fn();
};

const main = async () => {
    console.log('Starting binary compilation script')
    await checkIfCanStart();
    console.log(`Platform detected: ${platform}`);
    console.log(`File will be located at ${APP_FILE}`);

    const platformSteps = {
        darwin: [
            namedStep('Remove signature', () => $`codesign --remove-signature ${APP_FILE}`, true),
            namedStep('Inject SEA blob', () => $`pnpm postject ${APP_FILE} NODE_SEA_BLOB ${BLOB_PATH} --sentinel-fuse ${SENTINEL_FUSE} --macho-segment-name NODE_SEA`, true),
            namedStep('Sign binary', () => $`codesign --sign - ${APP_FILE}`, true)
        ],
        linux: [
            namedStep('Inject SEA blob', () => $`pnpm postject ${APP_FILE} NODE_SEA_BLOB ${BLOB_PATH} --sentinel-fuse ${SENTINEL_FUSE}`, true),
        ],
        win32: [
            namedStep('Remove signature', () => $`signtool remove /s ${APP_FILE}`),
            namedStep('Inject SEA blob', () => $`pnpm postject ${APP_FILE} NODE_SEA_BLOB ${BLOB_PATH} --sentinel-fuse ${SENTINEL_FUSE}`, true),
            namedStep('Sign binary', () => $`signtool sign /fd SHA256 ${APP_FILE}`),
        ]
    };

    const steps = [
        namedStep('Clean up dist directory', () => fs.remove(DIST_PATH)),
        namedStep('Build project', () => $`pnpm build:ts`),
        namedStep('Create bin directory if needed', createBinDirectoryIfNeeded),
        namedStep('Generate SEA blob', generateSeaBlob),
        namedStep('Copy Node binary', copyNodeBinary),
        ...platformSteps[platform] || []
    ];

    try {
        for (const [i, step] of steps.entries()) {
            console.log(`\nStep ${i + 1}/${steps.length}:`);
            await step();
        }

        console.log(`\nBinary compilation completed successfully! 🚀`);
    } catch (error) {
        exitWithError(`An error occurred during the compilation process:\n${error?.message || error}`);
    }
};

main().catch(error => {
    exitWithError(`An unexpected error occurred: ${error?.message || error}`);
});