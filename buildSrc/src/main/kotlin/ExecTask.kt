import org.gradle.api.DefaultTask
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction
import org.gradle.process.ExecOperations
import javax.inject.Inject
import kotlin.io.println as kPrintln

abstract class ExecTask : DefaultTask() {

    @get:Inject
    abstract val execOperations: ExecOperations

    private val isWindows = System.getProperty("os.name").lowercase().contains("windows")
    private val actions = mutableListOf<() -> Unit>()

    inner class CommandResultScope {
        fun println(message: String) = kPrintln(message)
    }

    inner class CommandResult(private val command: String) {
        private var successAction: (CommandResultScope.() -> Unit)? = null
        private var failAction: (CommandResultScope.(Int) -> Unit)? = null
        internal var exitCode: Int? = null

        fun onSuccess(action: CommandResultScope.() -> Unit): CommandResult {
            successAction = action
            return this
        }

        fun onFailure(action: CommandResultScope.(Int) -> Unit): CommandResult {
            failAction = action
            return this
        }

        internal fun run() {
            val scope = CommandResultScope()
            if (exitCode == 0) {
                successAction?.invoke(scope)
            } else {
                failAction?.invoke(scope, exitCode ?: -1)
                throw GradleException("❌ Command failed (exit code $exitCode): $command")
            }
        }
    }

    fun bashCommand(command: String): CommandResult {
        val result = CommandResult(command)
        actions.add {
            kPrintln("🚀 Executing: $command")
            val exitCode = execOperations.exec {
                standardOutput = System.out
                errorOutput = System.err
                isIgnoreExitValue = true
                if (isWindows) {
                    commandLine("powershell", "-Command", "& 'C:\\Program Files\\Git\\bin\\bash.exe' -c \"$command\"")
                } else {
                    commandLine("bash", "-c", command)
                }
            }.exitValue

            result.exitCode = exitCode
            result.run()
        }
        return result
    }

    fun bashCommands(vararg commands: String): CommandResult {
        return bashCommand(commands.joinToString(" && "))
    }

    fun println(message: String) {
        actions.add { kPrintln(message) }
    }

    @TaskAction
    fun execute() {
        actions.forEach { it() }
    }
}
