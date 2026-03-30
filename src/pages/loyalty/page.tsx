import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoyalty } from './hooks/useLoyalty';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import SchemaOrgLoyalty from './SchemaOrgLoyalty';
import PageMeta from '../../components/feature/PageMeta';


const LoyaltyPage = () => {
  const { card, loading, register, login, claimToken, redeemVr, redeemAuto, adminAddToken, adminSearchClients, adminGenerateResetCode, resetPasswordWithCode, changePin, validatePin, logout, refreshCard, fetchClientBookings, updateProfile } = useLoyalty();
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div style={{ background: '#010014', minHeight: '100vh', position: 'relative' }}>
      <PageMeta
        title="Клубная карта PARADOX VR CLUB Новосибирск — скидки до 20%, бесплатные часы VR"
        description="Клубная карта лояльности VR-клуба PARADOX в Новосибирске. 5 уровней скидок: от −5% до −20%. За каждые 5 часов VR-игры в будни — 1 час в подарок. Регистрация бесплатно."
        canonical="https://paradoxvr.ru/loyalty"
        keywords="клубная карта VR Новосибирск, скидка VR клуб Новосибирск, бонусная программа VR, лояльность VR клуб"
      />
      <SchemaOrgLoyalty />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          zIndex: 0,
        }}
      />

      <div
        className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 h-14"
        style={{ background: 'rgba(1,0,20,0.98)', borderBottom: '1px solid rgba(0,245,255,0.1)' }}
      >
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <i className="ri-arrow-left-line text-sm transition-transform group-hover:-translate-x-1" style={{ color: '#00f5ff' }} />
          <span className="font-orbitron text-xs font-bold tracking-wider" style={{ color: '#00f5ff' }}>PARADOX VR CLUB</span>
        </Link>
        <div className="flex items-center gap-2">
          <i className="ri-vip-crown-2-line text-xs" style={{ color: '#ff006e' }} />
          <span className="font-orbitron font-bold text-white tracking-widest" style={{ fontSize: '10px' }}>КАРТА ЛОЯЛЬНОСТИ</span>
        </div>
      </div>

      <div className="relative z-10 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ border: '2px solid rgba(0,245,255,0.3)', background: 'rgba(0,245,255,0.05)' }}>
              <i className="ri-loader-4-line text-xl animate-spin" style={{ color: '#00f5ff' }} />
            </div>
            <span className="font-mono-tech text-white/30 text-xs tracking-widest">ЗАГРУЗКА ДАННЫХ...</span>
          </div>
        ) : card ? (
          <Dashboard
            card={card}
            onClaimToken={claimToken}
            onRedeemVr={redeemVr}
            onRedeemAuto={redeemAuto}
            onLogout={logout}
            onShowAdmin={() => setShowAdmin(true)}
            onFetchBookings={fetchClientBookings}
            onUpdateProfile={updateProfile}
            onCardUpdate={refreshCard}
          />
        ) : (
          <RegisterForm onRegister={register} onLogin={login} onResetPassword={resetPasswordWithCode} />
        )}
      </div>

      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} onAddToken={adminAddToken} onChangePin={changePin} validatePin={validatePin} onSearchClients={adminSearchClients} onGenerateResetCode={adminGenerateResetCode} />
      )}
    </div>
  );
};

export default LoyaltyPage;
