import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiHeart, FiAward, FiUsers } from 'react-icons/fi';
import ellaImage from '../assets/ella.jpg';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen section-padding">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-display font-bold text-primary mb-4">
            {t('about.title')}
          </h1>
          <div className="w-20 h-1 bg-highlight mx-auto rounded-full"></div>
        </motion.div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src={ellaImage}
              alt="Crochet artist at work"
              className="rounded-2xl shadow-2xl w-full"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-display font-bold text-primary mb-6">
              {t('about.story')}
            </h2>
            <div className="space-y-4 text-text/70 leading-relaxed">
              <p>
                Welcome to Croche Ella, where every stitch tells a story. My journey with crochet began 
                several years ago as a simple hobby, but it quickly blossomed into a passion that now 
                defines my creative life.
              </p>
              <p>
                I believe that handmade items carry a special warmth and soul that mass-produced products 
                simply cannot replicate. Each piece I create is infused with love, patience, and attention 
                to detail, making it truly one-of-a-kind.
              </p>
              <p>
                From delicate flowers to practical bags and charming keychains, every creation is designed 
                to bring joy and beauty into your life. I use only high-quality materials and time-tested 
                techniques to ensure that each piece is not just beautiful, but also durable and functional.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-display font-bold text-primary mb-12 text-center">
            {t('about.values')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Handmade with Love</h3>
              <p className="text-text/70">
                Every piece is crafted with care and attention to detail, ensuring the highest quality.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAward className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Quality Materials</h3>
              <p className="text-text/70">
                We use only premium yarns and materials to create durable, long-lasting products.
              </p>
            </div>

            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">Customer Focused</h3>
              <p className="text-text/70">
                Your satisfaction is our priority. We work with you to create pieces you'll cherish.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-12 bg-gradient-to-br from-primary/10 to-highlight/10 text-center"
        >
          <h2 className="text-3xl font-display font-bold text-primary mb-6">
            {t('about.mission')}
          </h2>
          <p className="text-lg text-text/70 max-w-3xl mx-auto leading-relaxed">
            My mission is to bring the beauty of handmade crochet to people around the world. 
            I want to create pieces that not only look beautiful but also carry meaning and warmth. 
            Whether it's a gift for a loved one or something special for yourself, each creation 
            is made to bring a smile and add a touch of handmade charm to your life.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
