//
//  HybridNitroDataStorageSpec.hpp
//  NitroDataStorage
//

#pragma once

#include <NitroModules/HybridObject.hpp>
#include <NitroModules/AnyMap.hpp>
#include <vector>
#include <string>
#include <memory>

namespace margelo::nitro::datastorage {

using namespace margelo::nitro;

class HybridNitroDataStorageSpec: public virtual HybridObject {
public:
  // Using shared_ptr<AnyMap> for direct object passing without JSON serialization overhead
  virtual void setItem(const std::string& key, std::shared_ptr<AnyMap> value) = 0;
  virtual std::optional<std::shared_ptr<AnyMap>> getItem(const std::string& key) = 0;
  virtual bool removeItem(const std::string& key) = 0;
  virtual std::vector<std::string> getAllKeys() = 0;
  virtual void clear() = 0;
  virtual bool contains(const std::string& key) = 0;
  virtual double getCount() = 0;
};

} // namespace margelo::nitro::datastorage
