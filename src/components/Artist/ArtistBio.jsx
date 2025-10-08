import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ArtistBio = ({ artistData, bioText }) => {
  // Use the fetched bioText. If it's not available, fall back to the placeholder.
  const bio =
    bioText ||
    `A celebrated artist known for a unique blend of genres, ${artistData?.name} has captivated audiences worldwide with their soulful melodies and profound lyrics. Rising from humble beginnings, their passion for music has led them on a journey of sonic exploration, resulting in a discography that is both timeless and innovative.`;

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>About {artistData?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* The 'whitespace-pre-wrap' class helps preserve formatting like newlines from the API */}
          <p className="text-muted-foreground whitespace-pre-wrap">{bio}</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Add prop validation to satisfy the linter
ArtistBio.propTypes = {
  artistData: PropTypes.shape({
    name: PropTypes.string,
    bio: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        text: PropTypes.string,
      }),
    ]),
  }),
  bioText: PropTypes.string,
};

export default ArtistBio;
