import org.gradle.api.DefaultTask
import org.gradle.api.tasks.Internal
import org.gradle.process.ExecOperations
import org.gradle.process.ExecSpec
import javax.inject.Inject

object Extensions {
    val isWindows: Boolean
        get() = System.getProperty("os.name").lowercase().contains("windows")

    fun ExecSpec.bashCommand(command: String) {
        if (isWindows) {
            commandLine("powershell", "-Command", "& 'C:\\Program Files\\Git\\bin\\bash.exe' -c '$command'")
        } else {
            commandLine("bash", "-c", command)
        }
    }

    fun ExecSpec.bashCommands(vararg commands: String) {
        bashCommand(commands.joinToString(" && "))
    }
}
