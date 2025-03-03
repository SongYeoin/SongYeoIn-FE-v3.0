import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, LogOut } from 'lucide-react';
import { getMemberInfo, updateMemberInfo, withdrawMember } from '../../api/memberApi';
import { validateEmail, validatePassword } from './utils/validation';

const MyPageModal = ({ onClose }) => {
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [email, setEmail] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const fetchMemberInfo = async () => {
      try {
        const data = await getMemberInfo();
        setMember(data);
        setEmail(data.email);
      } catch (error) {
        setErrors({ api: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberInfo();
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [member, activeTab]);

  const tabs = [
    { id: 'profile', label: '프로필', icon: User },
    { id: 'password', label: '비밀번호', icon: Lock },
    { id: 'withdraw', label: '회원탈퇴', icon: LogOut },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (activeTab === 'profile' && isEditMode) {
      const emailError = validateEmail(email);
      if (emailError) newErrors.email = emailError;
    }

    if (activeTab === 'password') {
      if (!passwordData.currentPassword) {
        newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
      }
      const newPasswordError = validatePassword(passwordData.newPassword);
      if (newPasswordError) newErrors.newPassword = newPasswordError;
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = '새 비밀번호가 일치하지 않습니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validateForm()) return;

    try {
      await updateMemberInfo({
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('비밀번호가 성공적으로 변경되었습니다.');
    } catch (error) {
      setErrors({ api: error.message });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const updatedMember = await updateMemberInfo({ email });
      setMember(updatedMember);
      setEmail(updatedMember.email);
      setIsEditMode(false);
      alert('회원정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      setErrors({ api: error.message });
    }
  };

  const handleWithdraw = async () => {
    if (window.confirm('정말 탈퇴하시겠습니까?')) {
      try {
        await withdrawMember();
        alert('회원 탈퇴가 완료되었습니다.');
        window.location.href = '/';
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const renderErrorMessage = (fieldName) => {
    return errors[fieldName] && (
      <p className="text-sm text-red-500 mt-1">{errors[fieldName]}</p>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-[9999] overflow-y-auto">
      <div
        ref={contentRef}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-lg my-10"
        style={{
          minHeight: 'min-content',
          maxHeight: '90vh',
          margin: contentHeight > window.innerHeight * 0.8 ? '5vh auto' : 'auto',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">마이페이지</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setErrors({});
                setIsEditMode(false);
                if (id === 'profile') {
                  setEmail(member?.email || '');
                } else if (id === 'password') {
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setShowPassword({
                    current: false,
                    new: false,
                    confirm: false
                  });
                }
              }}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 text-sm font-medium transition-colors
               ${activeTab === id
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {errors.api && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {errors.api}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-bold">아이디</label>
                <input
                  type="text"
                  value={member?.username || ''}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-bold">이름</label>
                <input
                  type="text"
                  value={member?.name || ''}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-bold">생년월일</label>
                <input
                  type="text"
                  value={member?.birthday || ''}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-bold">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!isEditMode}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditMode
                      ? 'bg-white focus:ring-2 focus:ring-green-500'
                      : 'bg-gray-100 cursor-not-allowed'
                  }`}
                />
                {renderErrorMessage('email')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {isEditMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditMode(false);
                        setEmail(member?.email || '');
                        setErrors({});
                      }}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors duration-200"
                    >
                      저장
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="w-full col-span-2 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors duration-200"
                  >
                    수정
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              <div className="relative">
                <label className="text-sm text-gray-600 font-bold">현재 비밀번호</label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {renderErrorMessage('currentPassword')}
              </div>

              <div className="relative">
                <label className="text-sm text-gray-600 font-bold">새 비밀번호</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {renderErrorMessage('newPassword')}
              </div>

              <div className="relative">
                <label className="text-sm text-gray-600 font-bold">새 비밀번호 확인</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {renderErrorMessage('confirmPassword')}
              </div>

              <button
                onClick={handlePasswordChange}
                className="w-full px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors duration-200"
              >
                비밀번호 변경
              </button>
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">회원 탈퇴 전 꼭 확인해주세요!</h4>
                <ul className="text-sm text-red-700 space-y-2">
                  <li>• 탈퇴 시 모든 수강 정보가 삭제됩니다.</li>
                  <li>• 탈퇴 후에는 복구가 불가능합니다.</li>
                  <li>• 진행 중인 수업이 있다면, 종료 후 탈퇴하는 것을 권장합니다.</li>
                </ul>
              </div>
              <button
                onClick={handleWithdraw}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                회원 탈퇴
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPageModal;