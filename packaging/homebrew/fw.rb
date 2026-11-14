class Fw < Formula
  include Language::Python::Virtualenv

  desc "Download, verify and search open AI model weights from Allternit Freeweights"
  homepage "https://freeweights.allternit.com"
  url "https://github.com/Allternit/freeweights/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "REPLACE_WITH_SHA256_OF_TAGGED_TARBALL"
  license "Apache-2.0"

  depends_on "minisign"
  depends_on "python@3.12"

  def install
    virtualenv_install_with_resources
  end

  test do
    assert_match "usage: fw", shell_output("#{bin}/fw --help")
    assert_match "download and verify", shell_output("#{bin}/fw --help")
  end
end
