require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name            = "DataStorage"
  s.version         = package["version"]
  s.summary         = package["description"]
  s.description     = "A high-performance React Native storage module using SwiftData for iOS"
  s.homepage        = "https://github.com/eliilin/mmkv-vs-async_storage"
  s.license         = package["license"]
  s.platforms       = { :ios => "17.0" }
  s.author          = package["author"]
  s.source          = { :git => "https://github.com/eliilin/mmkv-vs-async_storage.git", :tag => "#{s.version}" }

  s.source_files    = "ios/**/*.{h,m,mm,swift}"
  s.swift_version   = "5.9"
  
  # Exclude DataStorage.h from module map to avoid C++ header conflicts
  s.exclude_files   = "ios/DataStorage.h"
  s.private_header_files = "ios/DataStorage.h"
  
  # Enable C++17 for TurboModule implementation
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'DEFINES_MODULE' => 'YES',
    'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES' => 'YES'
  }
  
  s.user_target_xcconfig = {
    'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES' => 'YES'
  }

  install_modules_dependencies(s)
end
