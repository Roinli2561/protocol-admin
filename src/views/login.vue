<template>
  <div class="login-container">
    <!-- 全屏背景图片 -->
    <div class="login-background"></div>

    <!-- 左侧内容区域 -->
    <div class="login-left">
      <div class="illustration-content">
        <!-- 平台标题 -->
        <div class="platform-title">witos开发平台</div>

        <!-- 底部内容区域 -->
        <div class="bottom-content">
          <!-- 底部标语 -->
          <div class="bottom-slogan">共 建 全 球 新 能 源 商 用 车 能 源 网 生 态</div>

          <!-- 版权信息 -->
          <div class="login-footer">
            <strong>版权所有 Copyright &copy; 2019-2025 &nbsp;
              <a href="http://witos.doc.huizhidata.com/" target="_blank">witos开发平台</a>&nbsp;&nbsp;技术支持：witos开发平台
            </strong>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区域 - 覆盖在背景上 -->
    <div class="login-right">
      <div class="login-form-container">
        <div class="welcome-text">欢迎登录</div>
        <div class="platform-name">witos开发平台</div>

        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              type="text"
              auto-complete="off"
              placeholder="请输入账号"
              class="custom-input"
            >
              <i slot="prefix" class="el-icon-user input-icon"></i>
            </el-input>
          </el-form-item>

           <el-form-item prop="password">
             <el-input
               v-model="loginForm.password"
               type="password"
               show-password
               auto-complete="off"
               placeholder="请输入密码"
               class="custom-input"
               @keyup.enter.native="handleLogin"
             >
               <i slot="prefix" class="el-icon-lock input-icon"></i>
             </el-input>
           </el-form-item>

          <el-form-item prop="code" v-if="captchaEnabled">
            <el-input
              v-model="loginForm.code"
              auto-complete="off"
              placeholder="验证码"
              class="custom-input code-input"
              @keyup.enter.native="handleLogin"
            >
              <i slot="prefix" class="el-icon-picture input-icon"></i>
            </el-input>
            <div class="login-code">
              <img :src="codeUrl" @click="getCode" class="login-code-img"/>
            </div>
          </el-form-item>

          <el-checkbox v-model="loginForm.rememberMe" class="remember-checkbox">记住密码</el-checkbox>

          <el-form-item class="login-button-item">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              class="login-button"
              @click.native.prevent="handleLogin"
            >
              <span v-if="!loading">登录</span>
              <span v-else>登录中...</span>
            </el-button>
            <div class="register-link" v-if="register">
              <router-link class="link-type" :to="'/register'">立即注册</router-link>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'
import logoImg from '@/assets/logo/logo.png'

export default {
  name: "Login",
  data() {
    return {
      logo: logoImg,
      codeUrl: "",
      loginForm: {
        username: "admin",
        password: "admin123",
        rememberMe: false,
        code: "",
        uuid: ""
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" }
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },
      loading: false,
      // 验证码开关
      captchaEnabled: true,
      // 注册开关
      register: false,
      redirect: undefined
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
    this.getCode();
    this.getCookie();
  },
  methods: {
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled;
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      };
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 });
            Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove('rememberMe');
          }
          this.$store.dispatch("Login", this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || "/" }).catch(()=>{});
          }).catch(() => {
            this.loading = false;
            if (this.captchaEnabled) {
              this.getCode();
            }
          });
        }
      });
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.login-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

// 全屏背景图片
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("../assets/images/login-background3.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

// 左侧内容区域
.login-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;

  .illustration-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px;
    padding-bottom: 20px;
  }

  .platform-title {
    font-size: 28px;
    font-weight: bold;
    color: #2c3e50;
    z-index: 10;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
  }

  .bottom-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .bottom-slogan {
    font-size: 16px;
    color: #20b5f9;
    letter-spacing: 8px;
    text-align: center;
    z-index: 10;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
  }
}


// 右侧登录区域 - 覆盖在背景上
.login-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 38%;
  min-width: 600px;
  height: 100%;
  background: rgba(234,238,238,.56);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;

  .login-form-container {
    width: 100%;
    max-width: 600px;
    padding: 0 40px;
  }

  .welcome-text {
    font-size: 24px;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 8px;
  }

  .platform-name {
    font-size: 32px;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 40px;
  }
}

// 登录表单样式
.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }

  .custom-input {
    .el-input__inner {
      height: 48px;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      font-size: 16px;
      padding-left: 40px;
      transition: all 0.3s ease;

      &:focus {
        border-color: #20b5f9;
        box-shadow: 0 0 0 2px rgba(32, 181, 249, 0.1);
      }
    }

     .input-icon {
       font-size: 18px;
       color: #8c9ba5;
       position: absolute;
       left: 12px;
       top: 50%;
       transform: translateY(-50%);
       z-index: 10;
     }
  }

  .code-input {
    width: 65%;
    display: inline-block;
  }

  .login-code {
    width: 30%;
    height: 48px;
    float: right;
    display: flex;
    align-items: center;
    justify-content: center;

    .login-code-img {
      height: 48px;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid #e1e8ed;
    }
  }

  .remember-checkbox {
    margin-bottom: 32px;

    .el-checkbox__label {
      color: #5a6c7d;
      font-size: 14px;
    }
  }

  .login-button-item {
    margin-bottom: 0;
  }

  .login-button {
    width: 100%;
    height: 48px;
    background: #20b5f9;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      background: #1a9fd8;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(32, 181, 249, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .register-link {
    text-align: right;
    margin-top: 16px;

    .link-type {
      color: #20b5f9;
      text-decoration: none;
      font-size: 14px;

      &:hover {
        color: #1a9fd8;
        text-decoration: underline;
      }
    }
  }
}

// 底部版权信息
.login-footer {
  background: transparent;
  font-size: 12px;
  color: #2c3e50;
  text-align: center;
  z-index: 10;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);

  a {
    color: #20b5f9;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
