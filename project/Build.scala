import com.byteground.sbt._
import com.typesafe.sbt.jse._
import com.typesafe.sbt.less._
import com.typesafe.sbt.less.SbtLess.autoImport._
import com.typesafe.sbt.web.SbtWeb.autoImport.WebKeys._
import com.typesafe.sbt.web.SbtWeb.autoImport._
import com.typesafe.sbt.web._
import sbt.Keys._
import sbt._

object Build extends Build {

  val lessSettings: Seq[Setting[_]] = Seq(
    includeFilter in LessKeys.less := "*.less",
    excludeFilter in LessKeys.less := "_*.less"
    //pipelineStages += htmlMinifier
  )

  val buildSettings = Seq(
    organization := "com.byteground",
    version := "0.0.1-SNAPSHOT",
    scalaVersion := "2.10.4",
    crossPaths := false,
    importDirectly := true
    //npmDependencies ++= Seq()
  )

  lazy val root =
    Project("byteground-web-util", file("."))
      .enablePlugins(
        //SbtByTeGround,
        SbtLess,
        SbtNpm,
        SbtWeb,
        SbtJsEngine
      ).settings(
        buildSettings ++
          Seq(
            libraryDependencies ++= Seq(
              //"org.webjars" % "requirejs" % "2.1.10"//example
            )
          ) ++
          inConfig(Assets)(lessSettings) ++
          inConfig(TestAssets)(lessSettings)
          : _*
      )
}
