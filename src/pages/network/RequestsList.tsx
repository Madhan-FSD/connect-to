import { ProfileCard } from "@/components/card/ProflieCard";

const RequestsList = ({ type, items, onAccept, onReject, onCancel }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((req: any) => {
        const u = type === "received" ? req.requester : req.recipient;
        return (
          <ProfileCard
            status={req?.status}
            key={req._id}
            id={u._id}
            name={`${u.firstName} ${u.lastName}`}
            handle={u.email?.split("@")[0]}
            bio={u.profileHeadline}
            avatarUrl={u.avatar?.url}
            connections={u.connectionCount}
            onConnect={
              type === "received"
                ? () => onAccept(req._id)
                : () => onCancel(req._id)
            }
            onMessage={
              type === "received" ? () => onReject?.(req._id) : undefined
            }
          />
        );
      })}
    </div>
  );
};

export default RequestsList;
