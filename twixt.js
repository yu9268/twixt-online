/** 
 * @fileoverview Twixt�̔ՖʁA�y�O�A�����N�̏�Ԃ��L�^���邽�߂̃N���X
 * @author necron_sub@necron-web.com (twitter_id: @necron)
 */

/**
 * Twixt�N���X
 */
var Twixt = (function() {
    /**
     * @constructor
     */
    var Twixt = function(size) {
      this.size = size;
      this.init();
    };
  
    var p = Twixt.prototype;
  
    /** 
     * ������
     */
    p.init = function() {
      this.map = new Array(this.size);
      this.num = 0;
      for(var i = 0; i < this.size; i++) {
        var col = new Array(this.size);
        for(var j = 0; j < this.size; j++) {
          col[j] = {num: 0, color: null, link: [false, false, false, false, false, false, false, false]};
        }
        this.map[i] = col;
        this.pp_mode = false;
      }
    };
    /** 
     * �w����W�ɂ��łɃy�O�����邩�ǂ����𔻒肵�܂� 
     * @param {string} x X���W�B[a-z]��������[A-Z]�Ŏw�肵�܂��B
     * @param {string} y Y���W�B1����27�܂ł̕�����i��:'01', '23'�j�B
     * @return {boolean} �w����W�Ƀy�O�����݂��邩�ǂ����B
     */
    p.is_placed = function(x, y) {
      var i = x.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
      var j = (y|0) - 1;
      if(!this.map[i]) {
        return false;
      }
      if(!this.map[i][j]) {
        return false;
      }
      if(this.map[i][j].color) {
        return true;
      } else {
        return false;
      }
    };
  
    /** 
     * �w����W�̃y�O����菜���܂��B 
     * @param {string} x X���W�B[a-z]��������[A-Z]�Ŏw�肵�܂��B
     * @param {string} y Y���W�B1����27�܂ł̕�����i��:'01', '23'�j�B
     * @return {boolean} ��菜�������ǂ����B
     */
    p.removePeg = function(x, y) {
      var i = x.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
      var j = (y|0) - 1;
  
      if( i < 0 || i > (this.size - 1) ) { return false; };
      if( j < 0 || j > (this.size - 1) ) { return false; };
  
      if(!this.map[i][j].color) { return false; }
  
      if(this.map[i][j].num !== 0) {
        if(this.map[i][j].num === this.num) {
          this.num--;
        }else{
          return false;
        }
      }
  
      if(this.map[i][j].link[0]) {
        this.map[i + 1][j - 2].link[4] = false;
      }
      if(this.map[i][j].link[1]) {
        this.map[i + 2][j - 1].link[5] = false;
      }
      if(this.map[i][j].link[2]) {
        this.map[i + 2][j + 1].link[6] = false;
      }
      if(this.map[i][j].link[3]) {
        this.map[i + 1][j + 2].link[7] = false;
      }
      if(this.map[i][j].link[4]) {
        this.map[i - 1][j + 2].link[0] = false;
      }
      if(this.map[i][j].link[5]) {
        this.map[i - 2][j + 1].link[1] = false;
      }
      if(this.map[i][j].link[6]) {
        this.map[i - 2][j - 1].link[2] = false;
      }
      if(this.map[i][j].link[7]) {
        this.map[i - 1][j - 2].link[3] = false;
      }
  
      this.map[i][j] = {num : 0, color: null, link: [false, false, false, false, false, false, false, false]};
  
      return true;
    };
  
    /** 
     * �w����W����w������ւ̃����N����菜���܂��B 
     * @param {string} x X���W�B[a-z]��������[A-Z]�Ŏw�肵�܂��B
     * @param {string} y Y���W�B1����27�܂ł̕�����i��:'01', '23'�j�B
     * @param {string} dir �����B1����������݂Ď��v����1����8�܂ŁB
     * @return {boolean} ��菜�������ǂ����B
     */
    p.removeLink = function(x, y, dir) {
      var i = x.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
      var j = (y|0) - 1;
      var d = (dir|0) - 1;
      var ret = false;
  
      if( i < 0 || i > (this.size - 1) ) { return false; };
      if( j < 0 || j > (this.size - 1) ) { return false; };
      if( d < 0 || d > 7 ) { return false; };
  
      if(!this.map[i][j].color) { return false; }
  
      if(this.map[i][j].link[d]) {
        this.map[i][j].link[d] = false;
  
        switch (d) {
        case 0:
          this.map[i + 1][j - 2].link[4] = false;
          break;
        case 1:
          this.map[i + 2][j - 1].link[5] = false;
          break;
        case 2:
          this.map[i + 2][j + 1].link[6] = false;
          break;
        case 3:
          this.map[i + 1][j + 2].link[7] = false;
          break;
        case 4:
          this.map[i - 1][j + 2].link[0] = false;
          break;
        case 5:
          this.map[i - 2][j + 1].link[1] = false;
          break;
        case 6:
          this.map[i - 2][j - 1].link[2] = false;
          break;
        case 7:
          this.map[i - 1][j - 2].link[3] = false;
          break;
        }
        ret = true;
      }
  
      return ret;
    };
  
    /** 
     * �w����W�Ƀy�O���Z�b�g���܂��B 
     * @param {string} x X���W�B[a-z]��������[A-Z]�Ŏw�肵�܂��B
     * @param {string} y Y���W�B1����27�܂ł̕�����i��:'01', '23'�j�B
     * @param {string} color �y�O�̐F�B'white'��������'black'�B
     * @param {boolean} countFlag true�̏ꍇ�A���y�O�����J�E���g�A�b�v�B
     * @return {boolean} �Z�b�g�������ǂ����B
     */
    p.setPeg = function(x, y, color, countFlag) {
      console.log("setPeg:", x, y, color, countFlag);
      var i = x.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
      var j = (y|0);
  
      if( i < 0 || i > (this.size - 1) ) { return false; };
      if( j < 0 || j > (this.size - 1) ) { return false; };
      if( color !== "black" && color !== "white") { return false; };
  
      // if( (i === 0 && j === 0) || (i === 0 && j === (this.size - 1)) ||
      //     (i === (this.size - 1) && j === 0) || (i === (this.size - 1) && j === (this.size - 1)) ) { return false; };
  
      if( (color === "black" && (i === 0 || i === (this.size - 1))) ||
          (color === "white" && (j === 0 || j === (this.size - 1))) ) { return false;};
  
      if(this.map[i][j].color) { return false; }
  
      this.map[i][j].color = color;
  
      if(countFlag) {
        this.num++;
        this.map[i][j].num = this.num;
      }
  
      this.checkLink0_(i, j);
      this.checkLink1_(i, j);
      this.checkLink2_(i, j);
      this.checkLink3_(i, j);
  
      this.checkLink0_(i - 1, j + 2);
      this.checkLink1_(i - 2, j + 1);
      this.checkLink2_(i - 2, j - 1);
      this.checkLink3_(i - 1, j - 2);
  
      return true;
    };
  
    /** 
     * PP���[�h�̐؂�ւ��B 
     * @param {boolean} mode true:PP���[�h false:�m�[�}�����[�h
     */
    p.setPPmode = function(mode) {
      this.pp_mode = mode;
    };
  
    /** 
     * �w����W�̎w������̃����N�����݂��邩�ǂ����BPP���[�h�̎��͑���̐F�̂݊m�F�B 
     * @param {number} i X���W�B
     * @param {number} j Y���W�B
     * @param {number} dir �����B1����������݂Ď��v����1����8�܂ŁB
     * @param {string} color �y�O�̐F�B'white'��������'black'�B
     * @return {boolean} �����N�����݂��Ȃ����ture�B
     * @private
     */
    p.is_not_linked_ = function(i, j, dir, color) {
      var tmp = this.map[i][j];
      return ((!tmp.link[dir]) || (this.pp_mode && (color === tmp.color)));
    };
  
    /** 
     * �w����W����1�������Ƀ����N�ł��邩���ׁA�\�ȏꍇ�����N���܂��B 
     * @param {number} i X���W�B
     * @param {number} j Y���W�B
     * @private
     */
    p.checkLink0_ = function(i, j) {
      var tmp1 = this.map[i]
      if(tmp1) { tmp1 = tmp1[j]; }
      var tmp2 = this.map[i + 1];
      if(tmp2) { tmp2 = tmp2[j - 2]; }
      if(tmp1 && tmp2) {
        if(tmp1.color === tmp2.color) {
          if( this.is_not_linked_(i    , j - 2, 2, tmp1.color) &&
              this.is_not_linked_(i    , j - 2, 3, tmp1.color) &&
              this.is_not_linked_(i    , j - 1, 1, tmp1.color) &&
              this.is_not_linked_(i    , j - 1, 2, tmp1.color) &&
              this.is_not_linked_(i    , j - 1, 3, tmp1.color) &&
              this.is_not_linked_(i + 1, j - 1, 5, tmp1.color) &&
              this.is_not_linked_(i + 1, j - 1, 6, tmp1.color) &&
              this.is_not_linked_(i + 1, j - 1, 7, tmp1.color) &&
              this.is_not_linked_(i + 1, j    , 6, tmp1.color) ) {
            tmp1.link[0] = true;
            tmp2.link[4] = true;
          }
        }
      }
    };
  
    /** 
     * �w����W����2�������Ƀ����N�ł��邩���ׁA�\�ȏꍇ�����N���܂��B 
     * @param {number} i X���W�B
     * @param {number} j Y���W�B
     * @private
     */
    p.checkLink1_ = function(i, j) {
      var tmp1 = this.map[i];
      if(tmp1) { tmp1 = tmp1[j]; }
      var tmp2 = this.map[i + 2];
      if(tmp2) { tmp2 = tmp2[j - 1]; }
      if(tmp1 && tmp2) {
        if(tmp1.color === tmp2.color) {
          if( this.is_not_linked_(i    , j - 1, 2, tmp1.color) &&
              this.is_not_linked_(i    , j - 1, 3, tmp1.color) &&
              this.is_not_linked_(i + 1, j - 1, 2, tmp1.color) &&
              this.is_not_linked_(i + 1, j - 1, 3, tmp1.color) &&
              this.is_not_linked_(i + 1, j - 1, 4, tmp1.color) &&
              this.is_not_linked_(i + 1, j    , 6, tmp1.color) &&
              this.is_not_linked_(i + 1, j    , 7, tmp1.color) &&
              this.is_not_linked_(i + 1, j    , 0, tmp1.color) &&
              this.is_not_linked_(i + 2, j    , 7, tmp1.color) ) {
            tmp1.link[1] = true;
            tmp2.link[5] = true;
          }
        }
      }
    };
  
    /** 
     * �w����W����4�������Ƀ����N�ł��邩���ׁA�\�ȏꍇ�����N���܂��B 
     * @param {number} i X���W�B
     * @param {number} j Y���W�B
     * @private
     */
    p.checkLink2_ = function(i, j) {
      var tmp1 = this.map[i];
      if(tmp1) { tmp1 = tmp1[j]; }
      var tmp2 = this.map[i + 2];
      if(tmp2) { tmp2 = tmp2[j + 1]; }
      if(tmp1 && tmp2) {
        if(tmp1.color === tmp2.color) {
          if( this.is_not_linked_(i + 2, j    , 4, tmp1.color) &&
              this.is_not_linked_(i + 2, j    , 5, tmp1.color) &&
              this.is_not_linked_(i + 1, j    , 3, tmp1.color) &&
              this.is_not_linked_(i + 1, j    , 4, tmp1.color) &&
              this.is_not_linked_(i + 1, j    , 5, tmp1.color) &&
              this.is_not_linked_(i + 1, j + 1, 7, tmp1.color) &&
              this.is_not_linked_(i + 1, j + 1, 0, tmp1.color) &&
              this.is_not_linked_(i + 1, j + 1, 1, tmp1.color) &&
              this.is_not_linked_(i    , j + 1, 0, tmp1.color) ) {
            tmp1.link[2] = true;
            tmp2.link[6] = true;
          }
        }
      }
    };
  
    /** 
     * �w����W����5�������Ƀ����N�ł��邩���ׁA�\�ȏꍇ�����N���܂��B 
     * @param {number} i X���W�B
     * @param {number} j Y���W�B
     * @private
     */
    p.checkLink3_ = function(i, j) {
      var tmp1 = this.map[i];
      if(tmp1) { tmp1 = tmp1[j]; }
      var tmp2 = this.map[i + 1];
      if(tmp2) { tmp2 = tmp2[j + 2]; }
      if(tmp1 && tmp2) {
        if(tmp1.color === tmp2.color) {
          if( this.is_not_linked_(i + 1, j    , 4, tmp1.color) &&
              this.is_not_linked_(i + 1, j    , 5, tmp1.color) &&
              this.is_not_linked_(i + 1, j + 1, 4, tmp1.color) &&
              this.is_not_linked_(i + 1, j + 1, 5, tmp1.color) &&
              this.is_not_linked_(i + 1, j + 1, 6, tmp1.color) &&
              this.is_not_linked_(i    , j + 1, 0, tmp1.color) &&
              this.is_not_linked_(i    , j + 1, 1, tmp1.color) &&
              this.is_not_linked_(i    , j + 1, 2, tmp1.color) &&
              this.is_not_linked_(i    , j + 2, 1, tmp1.color) ) {
            tmp1.link[3] = true;
            tmp2.link[7] = true;
          }
        }
      }
    };
  
    return Twixt;
  })();
  