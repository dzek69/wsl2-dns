WSL2 DNS synchronizer.

## Install:

- Run: `npm i -g wsl2-dns`
- From your Windows installation go to `C:\Windows\System32\drivers\etc` and take ownership of this file and/or make it
writable from non-elevated Notepad instance. You can do that manually, but I recommend to use [WinAero Tweaker][1] to
add `Take ownership` entry into file context menu.

## How it works:

This app will update IPs of your existing domains defined in Windows' `hosts` file to match wsl2 distro IP address
(which changes when wsl2 shuts down).

It will not add new entries.

Note that Windows does not support wildcard subdomains, so you still have to list your domains manually there even if
you run `wsl2-dns` with wildcard subdomains specified.

## Usage:

- `wsl2-dns domain1 [domain2 domain3 ...domainN]`  
    ^ where `domain` is either a full domain name to update or "wildcard" name starting with `.` dot to update all
    subdomains of that domain (excluding root domain itself!)

Example:
- `wsl2-dns bigproject.local .localhost`  
    ^ to update `bigproject.local`, `small.localhost`, `other.localhost`, but not `localhost`

> Warning: It is not recommended to replace `localhost` root level domain. Some Windows apps may rely on that pointing
> to 127.0.0.1.

## Recommended usage

- put `wsl2-dns` command in your `~/.profile` file, this way each time you start a new terminal window you will have
your dns domains updated
- choose single or multiple top-level domain (`.localhost` or any custom, I use `.dzek`) to avoid updating the
`.profile` file each time you add new subdomain (remember you need to update Windows' `hosts` file)

## FAQ / Errors:

> Error: `hosts` file is not writable. 

See **Install** part of this file. __Running as root will not help__ - it's the Windows host that prevents editing the
file, not Linux permissions.

> Error: Specify domains to update

See **Usage**.

> Error: `ip addr` command failed to start

Your distro is missing `ip` application.
- Debian/Ubuntu: install it with `sudo apt-get install iproute2`
- Centos: install it with `yum install iproute`
- Other distros: You have to Google that yourself.

> Could not find IP address

`ip addr` returns unexpected results. This apps looks for `eth0` network IP address. Please try running `ip addr`
manually and [report an issue][2].

## License

MIT

[1]: https://winaero.com/winaero-apps/
[2]: https://github.com/dzek69/wsl2-dns/issues/new
