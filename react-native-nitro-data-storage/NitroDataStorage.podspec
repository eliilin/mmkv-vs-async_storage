require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "NitroDataStorage"
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = package['homepage'] || "https://github.com/yourusername/react-native-nitro-data-storage"
  s.license      = package['license']
  s.authors      = package['author']
  s.platforms    = { :ios => "17.0" }
  s.source       = { :git => package['repository']['url'], :tag => "v#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.swift_version = '5.9'
  
  # C++ Configuration for NitroModules compatibility
  s.compiler_flags = '-x objective-c++'
  s.libraries = 'c++'
  
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
    'CLANG_CXX_LIBRARY' => 'libc++',
    'OTHER_CPLUSPLUSFLAGS' => '$(inherited) -std=c++20 -DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1',
    'GCC_PREPROCESSOR_DEFINITIONS' => '$(inherited) FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES',
    'HEADER_SEARCH_PATHS' => '$(inherited) "${PODS_ROOT}/RCT-Folly"'
  }

  # React Native and Nitro dependencies
  s.dependency "NitroModules"
  s.dependency "React-jsi"
  s.dependency "React-callinvoker"
  
  install_modules_dependencies(s)
end
