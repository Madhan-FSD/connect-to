import { ProfileCard } from "@/components/card/ProflieCard";

const SuggestionsList = ({ items, onConnect, status }) => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((u: any) => (
        <ProfileCard
          status={status}
          key={u._id}
          id={u._id}
          name={`${u.firstName} ${u.lastName}`}
          handle={u.email?.split("@")[0]}
          bio={u.profileHeadline}
          avatarUrl={u.avatar?.url}
          connections={u.connectionCount}
          onConnect={() => onConnect(u._id)}
        />
      ))}
    </div>
  );
};

export default SuggestionsList;
