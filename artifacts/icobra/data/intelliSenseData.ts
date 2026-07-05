export interface CompletionItem {
  label: string;
  kind: 'keyword' | 'class' | 'function' | 'variable' | 'property' | 'interface' | 'module' | 'snippet' | 'constant' | 'enum';
  detail?: string;
  documentation?: string;
  insertText?: string;
  parameters?: string[];
}

export const kotlinCompletions: CompletionItem[] = [
  { label: 'fun', kind: 'keyword', detail: 'Declares a function', documentation: 'Defines a function in Kotlin' },
  { label: 'class', kind: 'keyword', detail: 'Declares a class', documentation: 'Defines a class in Kotlin' },
  { label: 'object', kind: 'keyword', detail: 'Declares a singleton object', documentation: 'Creates a singleton' },
  { label: 'companion', kind: 'keyword', detail: 'Companion object', documentation: 'Companion object declaration' },
  { label: 'val', kind: 'keyword', detail: 'Immutable variable', documentation: 'Declares an immutable value binding' },
  { label: 'var', kind: 'keyword', detail: 'Mutable variable', documentation: 'Declares a mutable variable' },
  { label: 'data', kind: 'keyword', detail: 'Data class modifier', documentation: 'Creates a data class with equals/hashCode/copy' },
  { label: 'sealed', kind: 'keyword', detail: 'Sealed class modifier', documentation: 'Sealed class for restricted hierarchies' },
  { label: 'override', kind: 'keyword', detail: 'Override modifier', documentation: 'Overrides a member of a superclass' },
  { label: 'suspend', kind: 'keyword', detail: 'Suspend modifier', documentation: 'Marks a function as suspending for coroutines' },
  { label: 'coroutineScope', kind: 'function', detail: 'suspend fun coroutineScope(block: suspend CoroutineScope.() -> R): R', documentation: 'Creates a CoroutineScope with the given block', parameters: ['block: suspend CoroutineScope.() -> R'] },
  { label: 'launch', kind: 'function', detail: 'fun CoroutineScope.launch(...): Job', documentation: 'Launches a new coroutine' },
  { label: 'async', kind: 'function', detail: 'fun CoroutineScope.async(...): Deferred<T>', documentation: 'Creates a coroutine and returns its future result as Deferred' },
  { label: 'withContext', kind: 'function', detail: 'suspend fun <T> withContext(context: CoroutineContext, block: suspend CoroutineScope.() -> T): T', documentation: 'Calls the specified block with a given context' },
  { label: 'Dispatchers', kind: 'module', detail: 'CoroutineDispatcher providers', documentation: 'Provides standard CoroutineDispatchers' },
  { label: 'Dispatchers.Main', kind: 'property', detail: 'CoroutineDispatcher', documentation: 'Dispatcher confined to the main UI thread' },
  { label: 'Dispatchers.IO', kind: 'property', detail: 'CoroutineDispatcher', documentation: 'Dispatcher designed for offloading blocking IO tasks' },
  { label: 'Dispatchers.Default', kind: 'property', detail: 'CoroutineDispatcher', documentation: 'Default dispatcher backed by a shared pool of threads' },
  { label: 'listOf', kind: 'function', detail: 'fun <T> listOf(vararg elements: T): List<T>', documentation: 'Returns a new read-only list', parameters: ['vararg elements: T'] },
  { label: 'mutableListOf', kind: 'function', detail: 'fun <T> mutableListOf(vararg elements: T): MutableList<T>', documentation: 'Returns a new mutable list', parameters: ['vararg elements: T'] },
  { label: 'mapOf', kind: 'function', detail: 'fun <K, V> mapOf(vararg pairs: Pair<K, V>): Map<K, V>', documentation: 'Returns a new read-only map', parameters: ['vararg pairs: Pair<K, V>'] },
  { label: 'mutableMapOf', kind: 'function', detail: 'fun <K, V> mutableMapOf(): MutableMap<K, V>', documentation: 'Returns a new mutable map' },
  { label: 'setOf', kind: 'function', detail: 'fun <T> setOf(vararg elements: T): Set<T>', documentation: 'Returns a new read-only set', parameters: ['vararg elements: T'] },
  { label: 'println', kind: 'function', detail: 'fun println(message: Any?)', documentation: 'Prints the given message to standard output with a newline', parameters: ['message: Any?'] },
  { label: 'print', kind: 'function', detail: 'fun print(message: Any?)', documentation: 'Prints the given message to standard output', parameters: ['message: Any?'] },
  { label: 'require', kind: 'function', detail: 'fun require(value: Boolean)', documentation: 'Throws an IllegalArgumentException if the value is false', parameters: ['value: Boolean'] },
  { label: 'check', kind: 'function', detail: 'fun check(value: Boolean)', documentation: 'Throws an IllegalStateException if the value is false', parameters: ['value: Boolean'] },
  { label: 'let', kind: 'function', detail: 'fun <T, R> T.let(block: (T) -> R): R', documentation: 'Calls the specified function block with this value as its argument', parameters: ['block: (T) -> R'] },
  { label: 'also', kind: 'function', detail: 'fun <T> T.also(block: (T) -> Unit): T', documentation: 'Calls the specified function block with this value as its argument and returns this value', parameters: ['block: (T) -> Unit'] },
  { label: 'apply', kind: 'function', detail: 'fun <T> T.apply(block: T.() -> Unit): T', documentation: 'Calls the specified function block with this value as its receiver and returns this value', parameters: ['block: T.() -> Unit'] },
  { label: 'run', kind: 'function', detail: 'fun <T, R> T.run(block: T.() -> R): R', documentation: 'Calls the specified function block with this value as its receiver', parameters: ['block: T.() -> R'] },
  { label: 'with', kind: 'function', detail: 'fun <T, R> with(receiver: T, block: T.() -> R): R', documentation: 'Calls the specified function block with the given receiver as its receiver', parameters: ['receiver: T', 'block: T.() -> R'] },
  { label: 'takeIf', kind: 'function', detail: 'fun <T> T.takeIf(predicate: (T) -> Boolean): T?', documentation: 'Returns this value if predicate returns true', parameters: ['predicate: (T) -> Boolean'] },
  { label: 'takeUnless', kind: 'function', detail: 'fun <T> T.takeUnless(predicate: (T) -> Boolean): T?', documentation: 'Returns this value if predicate returns false', parameters: ['predicate: (T) -> Boolean'] },
  { label: 'Activity', kind: 'class', detail: 'android.app.Activity', documentation: 'An Activity is a single, focused thing that the user can do' },
  { label: 'AppCompatActivity', kind: 'class', detail: 'androidx.appcompat.app.AppCompatActivity', documentation: 'Base class for activities that wish to use some of the newer platform features' },
  { label: 'ViewModel', kind: 'class', detail: 'androidx.lifecycle.ViewModel', documentation: 'ViewModel is designed to store and manage UI-related data in a lifecycle conscious way' },
  { label: 'LiveData', kind: 'class', detail: 'androidx.lifecycle.LiveData<T>', documentation: 'LiveData is an observable data holder class' },
  { label: 'MutableLiveData', kind: 'class', detail: 'androidx.lifecycle.MutableLiveData<T>', documentation: 'MutableLiveData is a LiveData whose value can be set' },
  { label: 'StateFlow', kind: 'interface', detail: 'kotlinx.coroutines.flow.StateFlow<T>', documentation: 'A SharedFlow that represents a read-only state with a single updatable data value' },
  { label: 'MutableStateFlow', kind: 'interface', detail: 'kotlinx.coroutines.flow.MutableStateFlow<T>', documentation: 'A mutable StateFlow' },
  { label: 'Flow', kind: 'interface', detail: 'kotlinx.coroutines.flow.Flow<T>', documentation: 'An asynchronous data stream' },
  { label: 'collect', kind: 'function', detail: 'suspend fun <T> Flow<T>.collect(collector: FlowCollector<T>)', documentation: 'Terminal flow operator that collects the given flow' },
  { label: 'map', kind: 'function', detail: 'fun <T, R> Flow<T>.map(transform: suspend (value: T) -> R): Flow<R>', documentation: 'Returns a flow containing the results of applying the given transform' },
  { label: 'filter', kind: 'function', detail: 'fun <T> Flow<T>.filter(predicate: suspend (T) -> Boolean): Flow<T>', documentation: 'Returns a flow containing only values that match the given predicate' },
  { label: 'Shizuku', kind: 'class', detail: 'rikka.shizuku.Shizuku', documentation: 'Main Shizuku API class for permission and IPC management' },
  { label: 'Shizuku.checkSelfPermission', kind: 'function', detail: 'fun checkSelfPermission(): Int', documentation: 'Check Shizuku permission status' },
  { label: 'Shizuku.requestPermission', kind: 'function', detail: 'fun requestPermission(requestCode: Int)', documentation: 'Request Shizuku permission', parameters: ['requestCode: Int'] },
  { label: 'Shizuku.newProcess', kind: 'function', detail: 'fun newProcess(commands: Array<String>, env: Array<String>?, dir: String?): ShizukuRemoteProcess', documentation: 'Start a new process with elevated permissions via Shizuku' },
  { label: 'Bundle', kind: 'class', detail: 'android.os.Bundle', documentation: 'A mapping from String keys to various Parcelable values' },
  { label: 'Intent', kind: 'class', detail: 'android.content.Intent', documentation: 'An Intent is an abstract description of an operation to be performed' },
  { label: 'Context', kind: 'class', detail: 'android.content.Context', documentation: 'Interface to global information about an application environment' },
  { label: 'Log', kind: 'class', detail: 'android.util.Log', documentation: 'API for sending log output' },
  { label: 'Log.d', kind: 'function', detail: 'fun d(tag: String, msg: String): Int', documentation: 'Debug log', parameters: ['tag: String', 'msg: String'] },
  { label: 'Log.e', kind: 'function', detail: 'fun e(tag: String, msg: String): Int', documentation: 'Error log', parameters: ['tag: String', 'msg: String'] },
  { label: 'Log.i', kind: 'function', detail: 'fun i(tag: String, msg: String): Int', documentation: 'Info log', parameters: ['tag: String', 'msg: String'] },
];

export const xmlCompletions: CompletionItem[] = [
  { label: 'LinearLayout', kind: 'class', detail: 'android.widget.LinearLayout', documentation: 'A layout that arranges its children in a single column or row' },
  { label: 'RelativeLayout', kind: 'class', detail: 'android.widget.RelativeLayout', documentation: 'A layout that lets you specify the position of child objects relative to each other' },
  { label: 'ConstraintLayout', kind: 'class', detail: 'androidx.constraintlayout.widget.ConstraintLayout', documentation: 'A layout that allows you to position and size widgets in a flexible way' },
  { label: 'TextView', kind: 'class', detail: 'android.widget.TextView', documentation: 'Displays text to the user' },
  { label: 'Button', kind: 'class', detail: 'android.widget.Button', documentation: 'A push-button widget' },
  { label: 'EditText', kind: 'class', detail: 'android.widget.EditText', documentation: 'An EditText is a TextView that accepts editing' },
  { label: 'ImageView', kind: 'class', detail: 'android.widget.ImageView', documentation: 'Displays an arbitrary image' },
  { label: 'RecyclerView', kind: 'class', detail: 'androidx.recyclerview.widget.RecyclerView', documentation: 'A flexible view for providing a limited window into a large data set' },
  { label: 'ScrollView', kind: 'class', detail: 'android.widget.ScrollView', documentation: 'A view group that allows the view hierarchy placed within it to be scrolled' },
  { label: 'android:id', kind: 'property', detail: 'Resource ID attribute', documentation: 'Assigns an ID to this view' },
  { label: 'android:layout_width', kind: 'property', detail: 'Dimension or match_parent/wrap_content', documentation: 'Specifies the basic width of the view' },
  { label: 'android:layout_height', kind: 'property', detail: 'Dimension or match_parent/wrap_content', documentation: 'Specifies the basic height of the view' },
  { label: 'android:text', kind: 'property', detail: 'String resource reference', documentation: 'Formats the text content of the view' },
  { label: 'android:textSize', kind: 'property', detail: 'sp dimension', documentation: 'Size of the text' },
  { label: 'android:textColor', kind: 'property', detail: 'Color resource', documentation: 'Text color' },
  { label: 'android:background', kind: 'property', detail: 'Color or drawable', documentation: 'Background color or drawable' },
  { label: 'android:padding', kind: 'property', detail: 'Dimension', documentation: 'Sets the padding on all four edges' },
  { label: 'android:margin', kind: 'property', detail: 'Dimension', documentation: 'Sets the margin on all four edges' },
  { label: 'android:orientation', kind: 'property', detail: 'horizontal|vertical', documentation: 'Layout orientation' },
  { label: 'android:gravity', kind: 'property', detail: 'Gravity flags', documentation: 'Specifies how to place the content' },
  { label: 'android:visibility', kind: 'property', detail: 'visible|invisible|gone', documentation: 'Controls the initial visibility state' },
  { label: 'android:clickable', kind: 'property', detail: 'boolean', documentation: 'Defines whether this view reacts to click events' },
];

export const gradleCompletions: CompletionItem[] = [
  { label: 'implementation', kind: 'keyword', detail: 'Add a dependency', documentation: 'Adds a dependency to the implementation configuration' },
  { label: 'testImplementation', kind: 'keyword', detail: 'Test dependency', documentation: 'Adds a dependency to the test implementation configuration' },
  { label: 'androidTestImplementation', kind: 'keyword', detail: 'Android test dependency', documentation: 'Adds a dependency to the Android test implementation configuration' },
  { label: 'kapt', kind: 'keyword', detail: 'Kotlin annotation processing', documentation: 'Adds a kapt dependency' },
  { label: 'compileSdk', kind: 'property', detail: 'Int', documentation: 'Specifies the Android SDK version to compile against' },
  { label: 'minSdk', kind: 'property', detail: 'Int', documentation: 'Specifies the minimum API level required' },
  { label: 'targetSdk', kind: 'property', detail: 'Int', documentation: 'Specifies the API level that the app targets' },
  { label: 'versionCode', kind: 'property', detail: 'Int', documentation: 'Integer version number for the app' },
  { label: 'versionName', kind: 'property', detail: 'String', documentation: 'String version name displayed to users' },
  { label: 'buildTypes', kind: 'function', detail: 'Named domain object container', documentation: 'Container for build types' },
  { label: 'productFlavors', kind: 'function', detail: 'Named domain object container', documentation: 'Container for product flavors' },
  { label: 'signingConfigs', kind: 'function', detail: 'Named domain object container', documentation: 'Container for signing configurations' },
  { label: 'dependencies', kind: 'function', detail: 'DependencyHandler scope', documentation: 'Configuration block for project dependencies' },
  { label: 'plugins', kind: 'function', detail: 'PluginDependenciesSpec scope', documentation: 'Configuration block for plugins' },
];

export function getCompletionsForLanguage(language: string): CompletionItem[] {
  switch (language) {
    case 'kotlin': return kotlinCompletions;
    case 'xml': return xmlCompletions;
    case 'groovy': return gradleCompletions;
    default: return [];
  }
}

export function filterCompletions(items: CompletionItem[], prefix: string): CompletionItem[] {
  if (!prefix) return items.slice(0, 20);
  const lower = prefix.toLowerCase();
  return items
    .filter(item => item.label.toLowerCase().startsWith(lower))
    .slice(0, 10);
}
