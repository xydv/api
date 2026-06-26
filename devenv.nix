{
  pkgs,
  lib,
  config,
  ...
}:
{
  packages = [
    pkgs.bun
  ];

  languages = {
    javascript = {
      bun = {
        enable = true;
        install = {
          enable = true;
        };
      };
    };
  };
}
