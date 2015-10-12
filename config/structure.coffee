# Read more about app structure at http://docs.appgyver.com

module.exports =

  # See styling options for tabs and other native components in app/common/native-styles/ios.css or app/common/native-styles/android.css
  tabs: [
    {
      title: "Index"
      id: "index"
      location: "impraying#getting-started" # Supersonic module#view type navigation
    }
    {
      title: "Settings"
      id: "settings"
      location: "impraying#settings"
    }
    {
      title: "Internet"
      id: "internet"
      location: "http://google.com" # URLs are supported!
    }
  ]

  # rootView:
  #   location: "impraying#getting-started"

  preloads: [
    {
      id: "learn-more"
      location: "impraying#learn-more"
    }
    {
      id: "using-the-scanner"
      location: "impraying#using-the-scanner"
    }
  ]

  # drawers:
  #   left:
  #     id: "leftDrawer"
  #     location: "impraying#drawer"
  #     showOnAppLoad: false
  #   options:
  #     animation: "swingingDoor"
  #
  # initialView:
  #   id: "initialView"
  #   location: "impraying#initial-view"
