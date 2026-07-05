export type TestStatus = 'passed' | 'failed' | 'skipped' | 'running' | 'pending';

export interface TestCase {
  id: string;
  name: string;
  className: string;
  status: TestStatus;
  duration?: number;
  error?: string;
  line?: number;
}

export interface TestSuite {
  id: string;
  name: string;
  file: string;
  tests: TestCase[];
  status: TestStatus;
  totalDuration?: number;
}

export const testSuites: TestSuite[] = [
  {
    id: 'suite-1',
    name: 'MainActivityTest',
    file: 'app/src/test/MainActivityTest.kt',
    status: 'passed',
    totalDuration: 234,
    tests: [
      { id: 't1', name: 'onCreate_initializesCorrectly', className: 'MainActivityTest', status: 'passed', duration: 45, line: 20 },
      { id: 't2', name: 'checkShizukuPermission_whenGranted_proceedsToMain', className: 'MainActivityTest', status: 'passed', duration: 67, line: 35 },
      { id: 't3', name: 'checkShizukuPermission_whenDenied_showsRationale', className: 'MainActivityTest', status: 'passed', duration: 52, line: 50 },
      { id: 't4', name: 'onRequestPermissionsResult_granted_callsInitialize', className: 'MainActivityTest', status: 'passed', duration: 70, line: 70 },
    ],
  },
  {
    id: 'suite-2',
    name: 'ShizukuServiceTest',
    file: 'app/src/test/ShizukuServiceTest.kt',
    status: 'failed',
    totalDuration: 512,
    tests: [
      { id: 't5', name: 'initialize_setsIsInitializedTrue', className: 'ShizukuServiceTest', status: 'passed', duration: 88, line: 15 },
      { id: 't6', name: 'executeCommand_returnsOutput', className: 'ShizukuServiceTest', status: 'passed', duration: 120, line: 30 },
      { id: 't7', name: 'executeCommand_onException_returnsErrorMessage', className: 'ShizukuServiceTest', status: 'failed', duration: 145, error: 'Expected: "Error: " but was: "Error: Permission denied"\n\tat ShizukuServiceTest.kt:55', line: 50 },
      { id: 't8', name: 'isPackageInstalled_returnsTrue_whenInstalled', className: 'ShizukuServiceTest', status: 'passed', duration: 159, line: 65 },
    ],
  },
  {
    id: 'suite-3',
    name: 'UtilsTest',
    file: 'app/src/test/UtilsTest.kt',
    status: 'passed',
    totalDuration: 187,
    tests: [
      { id: 't9', name: 'formatFileSize_bytes_returnsCorrectString', className: 'UtilsTest', status: 'passed', duration: 22, line: 10 },
      { id: 't10', name: 'formatFileSize_kilobytes_returnsCorrectString', className: 'UtilsTest', status: 'passed', duration: 18, line: 20 },
      { id: 't11', name: 'formatFileSize_megabytes_returnsCorrectString', className: 'UtilsTest', status: 'passed', duration: 20, line: 30 },
      { id: 't12', name: 'getAndroidVersion_returnsValidString', className: 'UtilsTest', status: 'passed', duration: 127, line: 40 },
    ],
  },
  {
    id: 'suite-4',
    name: 'InstrumentedTests',
    file: 'app/src/androidTest/InstrumentedTest.kt',
    status: 'pending',
    tests: [
      { id: 't13', name: 'useAppContext_packageName_isCorrect', className: 'InstrumentedTests', status: 'pending', line: 15 },
      { id: 't14', name: 'shizukuService_onRealDevice_grantsPermission', className: 'InstrumentedTests', status: 'skipped', line: 25 },
    ],
  },
];

export function getTestStats(suites: TestSuite[]) {
  let passed = 0, failed = 0, skipped = 0, pending = 0;
  suites.forEach(s => s.tests.forEach(t => {
    if (t.status === 'passed') passed++;
    else if (t.status === 'failed') failed++;
    else if (t.status === 'skipped') skipped++;
    else pending++;
  }));
  return { passed, failed, skipped, pending, total: passed + failed + skipped + pending };
}
