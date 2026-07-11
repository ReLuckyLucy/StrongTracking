@echo off
setlocal enabledelayedexpansion
set "MAVEN_PROJECTBASEDIR=%~dp0"
set "CLASSWORLDS_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
if not defined JAVA_HOME ( echo ERROR: JAVA_HOME is not set & exit /b 1 )
"%JAVA_HOME%\bin\java.exe" %MAVEN_OPTS% %MAVEN_DEBUG_OPTS% -classpath "%CLASSWORLDS_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" "-Dmaven.wrapper.properties=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties" org.apache.maven.wrapper.MavenWrapperMain %*
