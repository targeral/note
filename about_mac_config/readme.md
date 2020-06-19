oh-my-mac 极致前端开发环境配置手册

显示器

- 公司发的 DELL 27 寸显示器，比较强劲：
  - 连上 macbook ，可以为其充电；
  - 左边 USB 口，可以接无线鼠标等设备；
  - 这样一来，macbook 上可以不需要再接充电器/拓展插槽了，桌面更为整洁。
macOS 系统设置
1. 打开系统偏好设置：点开左上角  图标 -> 系统偏好设置；
2. 先升级系统到最新版本：系统偏好设置 -> 软件更新；
3. 轻点来点按：系统偏好设置 -> 触控板 -> 勾选【轻点来点按】；
4. 三指拖动：系统偏好设置 -> 辅助功能 -> 指针控制 -> 鼠标与触控板 -> 触控板选项 -> 勾选【启用拖移 - 三指拖移】
5. Finder：
  1. 显示 -> 勾选【显示标签页栏】【显示路径栏】【显示状态栏】
  2. 偏好设置 -> 边栏 -> 标签 -> 取消勾选【最近使用的标签】
  3. 在个人家目录下新建一个 code 目录专门用来放项目代码，选中目录，然后：文件 -> 添加到边栏，将该目录添加到 Finder 边栏，方便快速定位。
6. 菜单栏：
  1. 点击电池图标 -> 显示百分比；
  2. 去掉 电池 等不经常使用的图标。
7. Spotlight(聚焦)：系统偏好设置 -> 聚焦 -> 搜索结果 -> 取消勾选【书签与历史记录】【字体】等无用内容。
开发工具
Xcode
- 除非是做 iOS 开发，否则没有必要安装几个 G 的 Xcode，直接安装  Xcode Command Line Tools 即可；
- 安装步骤：打开终端 -> xcode-select --install 回车 -> 按照提示完成操作即可。
- 为什么要安装这个东西呢，解释一下：它提供了一系列编译工具集(git, make, clang, gcc, etc)，下面安装 homebrew 也需要用到。
ssh-key
1. 命令行输入（不要停，一路 next 即可）：
# 请将下方的 yourname@example.com 换成你真实的邮箱地址。该命令运行过程中会询问你输入秘钥保存路径，密码等信息，不用理会也不用额外输入，直接默认下一步即可
ssh-keygen -o -t rsa -C "yourname@example.com" -b 4096
2. 拷贝生成的 ssh key ，在命令行输入并回车：
pbcopy < ~/.ssh/id_rsa.pub
Git 设置
- 打开终端输入：
# 请将下方的 yourname@example.com 换成你真实的邮箱地址
git config --global user.email "yourname@example.com"
git config --global user.name "你的中文名字"
Homebrew
- 伟大卓越的包管理工具。 无论用多么漂亮的词语来赞扬这个工具都不为过。
- 打开终端执行如下命令即可安装：
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
- 有了 homebrew，安装软件就变得简单了：
  - 安装开发包执行 brew install xxx 即可，比如安装 node : brew install node；
  - 对于非开源软件及有界面的软件，执行 brew cask install xxx 即可，比如安装 chrome：brew cask install google-chrome；
  - 如何确认我想要的软件是否被 homebrew 支持，执行 brew search xxx 即可。
字体
- 某些软件对字体有特殊需求（比如终端），因此提前安装 powerline 字体；
- 步骤：
## clone
git clone https://github.com/powerline/fonts.git --depth=1
## install
cd fonts
./install.sh
iTerm2
- 系统自带的终端软件就像记事本一样，勉强够用，想用来做开发还是差点什么，因此强烈建议使用 iTerm2 代替它。
- 打开终端执行如下命令即可安装：
brew cask install iterm2
- 还需要对它进行一点改造：
  - 打开 iTerm2 -> Preferences;
  - 修改 iTerm2 整体外观：Appearance -> General -> Theme(Minimal)
  - 安装新主题 Dracula ：
    - 下载 https://github.com/dracula/iterm/archive/master.zip，并解压；
    - 打开 iTerm2 > Preferences > Profiles > Colors -> 右下角 Color Presets 下拉框 -> import -> 选择刚才解压出来的 Dracula.itermcolors 文件，即可导入新主题；
    - Color Presets -> 选择刚才导入的 Dracula 主题使得生效。
  - 更换默认字体：
    - 打开 iTerm2 > Preferences > Profiles -> Text -> Font -> 选择【Source Code Pro for Poweline】 或者其他 powerline 类的字体
    - powerline 字体能够在终端中显示特殊的字符，大部分流行的终端主题都需要。
oh-my-zsh
- 安装命令如下：
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
- 主题：
  - 推荐使用 dracula
    - 安装命令如下：
git clone https://github.com/dracula/zsh.git "$ZSH_CUSTOM/themes/dracula"
ln -s $ZSH_CUSTOM/themes/dracula/dracula.zsh-theme $ZSH_CUSTOM/themes/dracula.zsh-theme
    - 编辑 .zshrc (vim ~/.zshrc)，修改 ZSH_THEME="dracula"，重启终端生效。
  - 其他推荐主题
    - powerlevel9k
    - spaceship
    - 官方内置主题(无需额外下载，直接编辑 .zshrc 即可启用)：https://github.com/robbyrussell/oh-my-zsh/wiki/themes
- 插件
  - 推荐插件
    - zsh-autosuggestions
    - zsh-syntax-highlighting
    - zsh-completions
    - z.lua
    - zsh-better-npm-completion
    - 内置插件列表：https://github.com/robbyrussell/oh-my-zsh/wiki/Plugins-Overview
  - 如何安装
    - 以 zsh-autosuggestions 为例，介绍安装步骤：
# 命令行执行以下命令即可
git clone https://github.com/zsh-users/zsh-autosuggestions.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestion
  - 如何启用插件，对于 内置插件，直接编辑 .zshrc 即可；对于非内置插件(需要下载)，先下载插件到插件目录(~/.oh-my-zsh/custom}/plugins)，再编辑 .zshrc
# vim ~/.zshrc
plugins=(
    sudo
    extract
    git
    copydir
    encode64
    colored-man-pages
    zsh-completions
    zsh-syntax-highlighting
    zsh-autosuggestions
    zsh-better-npm-completion
    z.lua
)
VScode
- 安装：brew cask install visual-studio-code
- 主题
  - Dracula Official
  - One Dark Pro
- 必装扩展
  - ESLint
  - Prettier
  - EditorConfig
  - Code Spell Checker
  - Bracket Pair Colorizer 2
  - ES6 snippets
  - GitLens
  - Debugger for Chrome
- 可选扩展
  - shell-format
  - Vim
  - Colorize
  - Todo Tree
Node.js
- 安装 nvm，最新安装方式见 https://github.com/nvm-sh/nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
安装完按照 nvm 指示检测是否安装成功。
- nvm 常用命令
nvm -h  # 查看使用方式
nvm ls  # 查看所有安装的 node 版本
nvm install <version> # 安装 node
nvm alias default 12.17.0  # 为所有 shell 终端指定默认版本
nvm use 12.17.0   # 为当前 shell 指定版本，关闭当前终端后，use 失效
- 修改源为公司私有源，提高 npm install 时的速度
node install nrm -g  # 安装源管理器
nrm ls
nrm add bnpm http://bnpm.byted.org
nrm use bnpm
tldr
- 安装
brew install tldr
- 相比 man 命令来说，tldr （ To Long, Don't Read）命令提供更为简洁的帮助文档。
ccat
- 安装
brew install ccat
- 可用来替代 cat 命令，支持语法高亮。 
- 另外一个类似的工具是 bat.
thefuck
- 安装
brew install thefuck
- 当你在终端因为手误输入错误时，紧接着输入一个  fuck ，就会自动帮你修正刚才的命令。
效率工具
浏览器
- 推荐使用 chrome 浏览器
- 推荐扩展
  - 沙拉查词
  - Octotree
  - JSONView
  - uBlock Origin
  - SmartTOC
  - Speed Dial2 New Tab
邮件
- 推荐使用【过滤器】来对邮件自动进行归类，否则重要的信息会被各种日常通知（比如“事故通报”）淹没。
  - https://mail.google.com/mail/u/0/#settings/filters 打开这个网址可以创建过滤器。
  - 创建过滤器的第二步记得勾选【跳过收件箱（将其归档）】
- 建议使用一个邮件客户端来接收邮件，推荐 macOS 自带的 mail.app
Snipaste
- 安装
brew cask install snipaste
- 这是一个非常神奇的软件，具体用法可以查阅官网或者搜索相关博文(1)。
draw.io
- 安装
brew cask install drawio
- 思维导图，流程图，图标制作工具。
Alfred
- 安装
brew cask install alfred
- 大名鼎鼎的效率神器，网上可以找到很多使用说明。
uTools
- 免费可替代 Alfred 的软件。
- https://u.tools/
Postman
- 安装
brew cask install postman
- Api 调试神器。
SourceTree
- 安装
brew cask install sourcetree
- Git 图形化工具，良好的可视化界面。
Glance
- https://github.com/samuelmeuli/glance
- 这是一个 quick look 插件。
内部开发生态